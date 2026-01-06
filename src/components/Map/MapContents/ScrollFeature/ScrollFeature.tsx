import React, {useEffect, useRef, useState} from 'react';
import styles from './ScrollFeature.module.scss';
import {Button, Col, Row} from "antd";
import {RightCircleOutlined, LeftCircleOutlined} from '@ant-design/icons';
import {Marker, Popup} from "react-leaflet";
import {useGlobalStore} from "@/providers/RootStoreProvider";
import L from 'leaflet';
import {markerScrollIcon} from '../Markers/MarkerIcons'

const ScrollFeature = () => {
    const globalStore = useGlobalStore();
    const data = globalStore.dataScroll;
    const circleRadius = 40; // Radius of the large circle
    const numSmallCircles = 10; // Number of small circles
    const smallCircleRadius = 5; // Radius of each small circle
    // Create an array to hold the small circles
    const [smallCircles, setSmallCircles] = useState<any>([]);
    const [span, setSpan] = useState<number>();
    const [isStart, setIsStart] = useState(true);
    const [iNumber, setINumber] = useState<any>(null);
    const [iPercent, setIPercent] = useState<any>(null);
    const [date, setDate] = useState<any>(null);
    const stepDate = Math.floor((data.endDate - data.startDate) / ((data.endPerformance - data.startPerformance - 1) / data.stepPerformance)) == 0 ? 1
        : Math.floor((data.endDate - data.startDate) / ((data.endPerformance - data.startPerformance - 1) / data.stepPerformance));
    const [priorCount, setPriorCount] = useState(0);
    const [previousCount, setPreviousCount] = useState(0);

    const randomNumberInRange = (min: number, max: number) => {
        // 👇️ get number between min (inclusive) and max (inclusive)
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    useEffect(() => {
        setINumber(10 - (data.startPerformance / 10));
        setIPercent(data.startPerformance);
        setDate(data.startDate);
    }, []);

    useEffect(() => {
        setSpan(Math.floor((24 - 3) / data.functions.length))
        let newCircles = []
        for (let i = 0; i < numSmallCircles; i++) {
            let x = 0;
            let y = 0;
            let fill = '';
            if (i < iNumber) {
                fill = data.startColor
                y = randomNumberInRange(20, 70) - 5
                x = randomNumberInRange(18, 38) - 5
            } else {

                fill = data.endColor
                y = randomNumberInRange(20, 70) - 5
                x = randomNumberInRange(45, 70) - 5
            }
            // Create a small circle element
            const smallCircle = (
                <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={smallCircleRadius}
                    fill={fill} // You can change the color here
                />
            );
            // Add the small circle to the array
            // smallCircles.push(smallCircle);
            newCircles.push(smallCircle);
        }
        setSmallCircles(newCircles);
    }, [iNumber])

    useEffect(() => {
        if (priorCount > 0) {
            const interval = setInterval(() => {
                handlePrior();
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [date, iPercent]);

    useEffect(() => {
        if (previousCount > 0) {
            const interval = setInterval(() => {
                handlePrevious();
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [date]);

    const handlePrior = () => {
        let number = iPercent + data.stepPerformance;
        let dateStep = Number(date) + Number(stepDate);
        if (dateStep >= data.endDate) {
            dateStep = data.endDate;
        }
        if (number >= data.endPerformance) {
            number = data.endPerformance;
            dateStep = data.endDate;
            setPriorCount(0);
        } else setPriorCount(priorCount + 1);
        setIPercent(number);
        setINumber(10 - (number / 10));
        setDate(dateStep);
    }

    const handlePrevious = () => {
        let number = iPercent - data.stepPerformance;
        let dateStep = Number(date) - Number(stepDate);
        if (number <= data.startPerformance) {
            number = data.startPerformance;
            dateStep = data.startDate;
            setPreviousCount(0);
        } else setPreviousCount(priorCount + 1);
        setIPercent(number);
        setINumber(10 - (number / 10));
        setDate(dateStep);
    }

    return (
        <Marker position={[0, 0]} icon={markerScrollIcon()}>
            <Popup>
                <div className={styles.scrollFeatureIcon}>
                    {/*starDate, endDate*/}
                    <Row style={{
                        display: "flex",
                        justifyContent: "center",
                        fontSize: 17,
                        fontWeight: 700
                    }}>{date}</Row>
                    {/*hình tròn*/}
                    <Row gutter={{xs: 8, sm: 16, md: 24, lg: 32}}>
                        <Col span={1} style={{display: "flex", paddingLeft: 10}}>
                        </Col>
                        {
                            data.functions.map((value: any) =>
                                // eslint-disable-next-line react/jsx-key
                                <ScrollFeatureItem circleRadius={circleRadius}
                                                   smallCircles={smallCircles}
                                                   span={span}
                                                   name={value}/>
                            )
                        }
                        <col span={1}/>
                    </Row>
                    {/*phần trăm*/}
                    <Row
                        className={styles.scroll}
                        gutter={{xs: 8, sm: 16, md: 24, lg: 32}}>
                        <Col span={1} style={{display: "flex", paddingLeft: 10}}>
                            <Button onClick={handlePrevious} type="text" disabled={date < data.endDate || iPercent != data.endPerformance}
                                    icon={<LeftCircleOutlined />}>
                            </Button>
                        </Col>
                        {
                            // eslint-disable-next-line react/jsx-key
                            data.functions.map(() => <Col className="gutter-row " span={span}
                                                          style={{textAlign: "center"}}>
                                {iPercent} %
                            </Col>)
                        }
                        <Col span={1} style={{display: "flex", justifyContent: "end"}}>
                            <Button onClick={handlePrior} type="text" disabled={date > data.startDate || iPercent != data.startPerformance}
                                    icon={<RightCircleOutlined />}>
                            </Button>
                        </Col>
                    </Row>
                </div>
            </Popup>
        </Marker>
    );
};

const ScrollFeatureItem = (props: any) => {
    const {circleRadius, smallCircles, span, name} = props;
    return (
        <Col className="gutter-row" span={span}
             style={{
                 textAlign: "center"
             }}
        >
            <svg width={circleRadius * 2} height={circleRadius * 2}>
                <circle
                    cx={circleRadius}
                    cy={circleRadius}
                    r={circleRadius}
                    fill="transparent"
                    stroke="black" // You can change the circle's stroke color here
                />
                {smallCircles}
            </svg>
            <div>{name}</div>
        </Col>
    );
}

export default ScrollFeature;
