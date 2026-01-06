import {observer} from "mobx-react-lite";
import styles from "./_ModalContents.module.scss";
import React, {useEffect, useState} from "react";
import {useCountryStore, useGlobalStore} from "@/providers/RootStoreProvider";
import {CloseIcon} from "@/components/Icons/Icons";
import {Button, Col, Form, Input, notification, Radio, Row, Select, Table} from "antd";
import {ColumnsType} from "antd/es/table";
import SearchCountry from "@/components/Tools/TopTools/ToolItems/SearchCountry";
import {DeleteOutlined} from "@ant-design/icons";
import * as turf from "@turf/turf";

interface DataType {
    key?: string;
    functionName?: string;
    startDate?: number | null;
    endDate?: number | null;
    country?: any;
    startPerformance?: number | null;
    startPerformanceTitle?: string;
    endPerformance?: number | null;
    endPerformanceTitle?: string;
    simulation?: string;
    numberFunction?: number | null | undefined;
    startColor?: string;
    endColor?: string;
}

enum notificationDes {
    country = 'A country cannot be duplicated.  ' +
        'It is not possible to identify a duplicate country or a country twice.  ' +
        'The selected country is already added or in the map and cannot be added to the map or view again.  ' +
        'Please, select another country.',
    function = 'A function cannot be duplicated.  ' +
        'It is not possible to identify a duplicate function or a function twice.  ' +
        'The selected function is already added or in the map and cannot be added to the map or view again.  ' +
        'Please, select another function.',
    date = 'The start date must be less than the end date',
    Performance = 'The start performance must be less than the end performance'

}

const ScrollFeatureViewM = () => {
    const columns: ColumnsType<DataType> = [
        {
            title: 'Action',
            dataIndex: '',
            key: 'x',
            render: (text, row) => (
                <Button onClick={() => handleDelete(row)}
                        icon={<DeleteOutlined />}>
                </Button>
            ),
        },
        {
            title: 'Functions',
            dataIndex: 'functionName',
            width: 100,
        },
        {
            title: 'Countries',
            dataIndex: 'country',
            width: 150,
        },
        {
            title: 'Number of functions',
            dataIndex: 'numberFunction',
            width: 150,
        },
        {
            title: 'Start Date',
            dataIndex: 'startDate',
            width: 100,
        },
        {
            title: 'End Date',
            dataIndex: 'endDate',
            width: 100,
        },
        {
            title: 'Start Performance',
            dataIndex: 'startPerformanceTitle',
            width: 150,
        },
        {
            title: 'End Performance',
            dataIndex: 'endPerformanceTitle',
            width: 150,
        },
    ];

    const {Option} = Select;
    type FieldType = {
        functionName?: string;
        startDate?: number;
        endDate?: number;
        country?: string;
        startPerformance?: string;
        endPerformance?: string;
        simulation?: string;
        numberFunction?: number
    };
    const initialValues: DataType = {
        key: "",
        functionName: "",
        startDate: null,
        endDate: null,
        country: "",
        startPerformance: null,
        endPerformance: null,
        simulation: "ggreen",
        numberFunction: null
    }
    const [api, contextHolder] = notification.useNotification();
    const [data, setData] = useState<DataType[]>([]);
    const [country, setCountry] = useState<any>(null);
    const [radioValue, setRadioValue] = useState('manual');
    const [isClickAdd, setIsClickAdd] = useState<boolean>(false);
    const [form] = Form.useForm();
    const globalStore = useGlobalStore();
    const countryStore = useCountryStore();
    useEffect(() => {
        if (country != null && radioValue == 'automatic') countFunctionOfEachCountry();
    }, [country]);

    const closeModal = () => {
        globalStore.resetPositionScroll();
    }
    const handleCountry = (value: any) => {
        setCountry(value)
    }

    const handleSave = () => {
        closeModal();
        const startPer = data[0].startPerformance == null ? 0 : data[0].startPerformance;
        const endPer = data[0].endPerformance == null ? 0 : data[0].endPerformance;
        const functions = data.map(value => value.functionName);
        let countNumberOfFunction = 0;
        let numberMax = 0;
        data.forEach(value => {
            const numberFunction = Number(value.numberFunction) ? Number(value.numberFunction) : 0;
            countNumberOfFunction += numberFunction;
            numberMax = numberFunction > numberMax ? numberFunction : numberMax;
        });
        const numberMin = Math.round(countNumberOfFunction / data.length);
        const stepPerformance = Math.round(numberMax / numberMin);

        const dataScroll = {
            startPerformance: Number(startPer),
            endPerformance: Number(endPer),
            stepPerformance: stepPerformance,
            startColor: data[0].startColor,
            endColor: data[0].endColor,
            functions: functions,
            startDate: data[0].startDate,
            endDate: data[0].endDate

        }
        globalStore.setDataScroll(dataScroll);
        setIsClickAdd(false);
    }

    const clickAddBtn = () => {
        setIsClickAdd(true);
    }

    const convertColor = (value: string | undefined) => {
        switch (value) {
            case 'rred':
                return {
                    startColor: "red",
                    endColor: "red"
                }
            case 'red':
                return {
                    startColor: "red",
                    endColor: "green"
                }
            case 'ggreen':
                return {
                    startColor: "green",
                    endColor: "green"
                }
            case 'green':
                return {
                    startColor: "green",
                    endColor: "red"
                }
            default:
                return {
                    startColor: "",
                    endColor: ""
                }
        }
    }

    const countFunctionOfEachCountry = () => {
        const countryStoreData = countryStore.countries.find(value => value.name.codeName == country.codeName);
        let count = 0;
        if (globalStore.mapLayer.length > 0 && countryStoreData != null) {
            for (let i = 0; i < globalStore.mapLayer.length; i++) {
                let functionName = globalStore.mapLayer[i].type
                if (functionName != null && functionName === 'function') {
                    let lat = globalStore.mapLayer[i].lat;
                    let lng = globalStore.mapLayer[i].lng;
                    const point = turf.point([Number(lng), Number(lat)]);
                    if (countryStoreData.data[0].features[0].geometry.type === "MultiPolygon") {
                        countryStoreData.data[0].features[0].geometry.coordinates.forEach((coordinate: any) => {
                            const polygon = turf.polygon(coordinate)
                            if (turf.booleanPointInPolygon(point, polygon)) {
                                count++;
                            }
                        })
                    } else {
                        // @ts-ignore
                        const polygon = turf.polygon(countryStoreData.data[0]?.features[0]?.geometry.coordinates);
                        if (turf.booleanPointInPolygon(point, polygon)) {
                            count++;
                        }
                    }
                }
            }
        }
        form.setFieldsValue({
            numberFunction: count,
        });
    }

    const openNotification = (description: string) => {
        api.open({
            message: 'Warning',
            type: 'warning',
            duration: 3,
            description: description,
        });
    };
    const isDuplicateContry = () => {
        return data.find(value => value.country == country.fullName) == undefined ||
            data.find(value => value.country == country.fullName) == null;
    }

    const isDuplicateFunction = (value: DataType) => {
        return data.find(e => e.functionName == value.functionName) == undefined ||
            data.find(e => e.functionName == value.functionName) == null;
    }

    const validate = (value: DataType) => {
        let flag = true;
        if (!isDuplicateContry()) {
            flag = false;
            openNotification(notificationDes.country);
        } else if (!isDuplicateFunction(value)) {
            flag = false;
            openNotification(notificationDes.function);
        }
        return flag;
    }

    const onFinish = (value: DataType) => {
        if (validate(value) && isClickAdd) {
            const simulation = value?.simulation ? value?.simulation : (data[0]?.simulation ? data[0].simulation : 'ggreen');
            const objectColor = convertColor(simulation);
            const copyValue: DataType = {
                ...value,
                key: country + "-" + data.length,
                country: country.fullName,
                startPerformanceTitle: `${value.startPerformance}% ${objectColor.startColor}`,
                endPerformanceTitle: `${value.endPerformance}% ${objectColor.endColor}`,
                startColor: objectColor.startColor,
                endColor: objectColor.endColor,
            }
            const dataCopy: any = data.map((item: any, index: number) => {
                item = {
                    ...item,
                    key: country + "-" + index,
                    startPerformanceTitle: `${value.startPerformance}% ${objectColor.startColor}`,
                    endPerformanceTitle: `${value.endPerformance}% ${objectColor.endColor}`,
                    startColor: objectColor.startColor,
                    endColor: objectColor.endColor,
                    startDate: value.startDate,
                    endDate: value.endDate,
                }
                return item;
            })
            dataCopy.push(copyValue);
            setData(dataCopy);
            setIsClickAdd(false);
            // onReset();
        }
    }

    const onReset = () => {
        form.resetFields();
        setCountry(null);
    };
    const handleRadio = (value: any) => {
        if (value.target.value == 'automatic' && country != null) {
            countFunctionOfEachCountry();
        }
        setRadioValue(value.target.value);
    }

    const handleDelete = (row: DataType) => {
        const list = data.filter(value => value.key != row.key);
        setData(list);
    }

    return (
        <div>
            {contextHolder}
            <div className={`${styles['simulation-setting-wrap']}`} onClick={e => e.stopPropagation()}>
                <div className={`${styles['header']}`}>
                    <button onClick={closeModal}><CloseIcon/></button>
                </div>
                <div className={`${styles['main']}`}>
                    <div className={`${styles['main-content']}`} style={{padding: 10}}>
                        <Form
                            form={form}
                            name="control-hooks"
                            labelCol={{span: 11}}
                            wrapperCol={{span: 13}}
                            style={{maxWidth: 1000}}
                            // initialValues={initialValues}
                            onFinish={onFinish}
                            autoComplete="off"
                        >
                            <Radio.Group value={radioValue} onChange={handleRadio}>
                                <Radio value={'automatic'}>Automatic</Radio>
                                <Radio value={'manual'}>Manual</Radio>
                            </Radio.Group>
                            <Row gutter={[10, 24]}>
                                <Col span={12}>
                                    <Form.Item<FieldType>
                                        label="Function name"
                                        name="functionName"
                                        rules={[{required: true, message: 'input is required'}]}
                                    >
                                        <Input/>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item<FieldType>
                                        label="Start Date"
                                        name="startDate"
                                        rules={[{required: true, message: 'input is required'}]}
                                    >
                                        <Input type={"number"}/>

                                    </Form.Item>
                                </Col>

                            </Row>
                            <div style={{margin: 10}}></div>
                            <Row gutter={[10, 24]}>
                                <Col span={12}>
                                    <Form.Item<FieldType>
                                        label="Select Country"
                                        name="country"
                                    >
                                        <SearchCountry setCountry={handleCountry}/>
                                        {/*{country != null ? <span style={{color:'red'}}>input is required</span> : null}*/}
                                        {/*<Input/>*/}
                                    </Form.Item>

                                </Col>
                                <Col span={12}>
                                    <Form.Item<FieldType>
                                        label="End Date"
                                        name="endDate"
                                        rules={[{required: true, message: 'input is required'},
                                            ({getFieldValue}) => ({
                                                validator(_, value) {
                                                    if (!value || Number(getFieldValue('startDate')) < Number(value)) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(new Error('The start date must be less than the end date'));
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input type={"number"}/>
                                    </Form.Item>
                                </Col>
                            </Row>
                            <div style={{margin: 10}}/>
                            <Row>
                                <Col span={12}>
                                    <Form.Item<FieldType>
                                        label="Start Performance"
                                        name="startPerformance"
                                        rules={[{required: true, message: 'input is required'}]}
                                    >
                                        <Input type={"number"}/>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item<FieldType>
                                        label="End Performance"
                                        name="endPerformance"
                                        rules={[{required: true, message: 'input is required'},
                                            ({getFieldValue}) => ({
                                                validator(_, value) {
                                                    if (!value || Number(getFieldValue('startPerformance')) < Number(value)) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(new Error('The start performance must be less than the end performance'));
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input type={"number"}/>
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={[10, 24]}>
                                <Col span={12}>
                                    <Form.Item<FieldType>
                                        label="simulation From"
                                        name="simulation"
                                    >
                                        <select defaultValue="ggreen">
                                            <option value="ggreen">Green to green</option>
                                            <option value="red">Red to green</option>
                                            <option value="rred">Red to red</option>
                                            <option value="green">Green to red</option>
                                        </select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item<FieldType>
                                        label="Number function"
                                        name="numberFunction"
                                        rules={[{required: true, message: 'input is required'}]}
                                        shouldUpdate
                                    >
                                        <Input type={"number"} disabled={radioValue == 'automatic'}/>
                                        {/*<InputNumber disabled={radioValue == 'automatic'}/>*/}
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={12}/>
                                <Col span={8}>
                                    <Row justify="space-between">
                                        <Col span={12}>
                                            <Form.Item<FieldType>>
                                                <Button size="middle" type="primary" htmlType="submit"
                                                        onClick={clickAddBtn}>
                                                    Add
                                                </Button>
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item<FieldType>>
                                                <Button type="default" htmlType="button" onClick={onReset}>
                                                    Clear
                                                </Button>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <div style={{margin: 10}}/>
                            {
                                data && data.length >= 0 &&
                                <Row>
                                    <Table columns={columns}
                                           dataSource={data}
                                           pagination={{pageSize: 50}} scroll={{y: 240}}/>
                                </Row>
                            }
                        </Form>
                    </div>
                </div>
                <div className={`${styles['footer']}`}>
                    <small></small>
                    <div className={`${styles['option-btns']}`}>
                        <button className='primary-btn' onClick={handleSave}>
                            OK
                        </button>
                        <button className='secondary-btn' onClick={closeModal}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default observer(ScrollFeatureViewM);
