/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import IMG_USER from '@/assets/images/user.jpg';
import styles from './_ToolItem.module.scss';
import Image from 'next/image';
import {observer} from 'mobx-react-lite';
import {useGlobalStore, useUserStore} from '@/providers/RootStoreProvider';
import ModalWrap from '@/components/Modals/ModalWrap';
import DefaultLocationM from '@/components/Modals/ModalContents/DefaultLocationM';
import {getLocation} from '@/utils/get_geolocation';
import {useRouter} from "next/router";
import {tree} from "next/dist/build/webpack/loaders/next-route-loader/templates/app-page";
import SwitchComp from "@/components/Switch/SwitchComp";


const User: React.FC = (): JSX.Element => {
    const globalStore = useGlobalStore();
    const [toggleLocationModal, setToggleLocationModal] = useState<boolean>(false);
    const userStore = useUserStore();
    const router = useRouter();

    const getAuthToken = () => {
        return localStorage.getItem('accessToken');
    };

    const updateRole = (role: string) => {
        let user = localStorage.getItem('user')
        if (user && user.length) {
            user = JSON.parse(user);
            const updatedUser = {...user, role: role};
            localStorage.setItem('user', JSON.stringify(updatedUser));
            userStore.updateUserRole(role)
        }
    }

    const onSwitchRole = async () => {
        const oldRole = userStore.hasRole("user") ? "user" : "provider"
        const newRole = userStore.hasRole("user") ? "provider" : "user"
        try {
            updateRole(newRole)
            const token = getAuthToken();
            const response = await fetch('/api/user/change-role', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({role: newRole}),
            });

            if (!response.ok) {
                // const errorData = await response.json();
                // console.error(errorData.error || 'Failed onSwitchRole');
                updateRole(oldRole)
            }

        } catch (e) {
            // console.error("[ERROR] onSwitchRole:", e)
            updateRole(oldRole)
        }
    }

    return (
        <div className={`${styles['user-wrap']}`}>
            {toggleLocationModal && (
                <ModalWrap setToggleModal={setToggleLocationModal}>
                    <DefaultLocationM setToggleModal={setToggleLocationModal}/>
                </ModalWrap>
            )}
            <div className={`${styles['user']}`}>
                <Image src={IMG_USER} alt='user' width={30} height={30}/>
                <div className={`${styles['info']}`}>
                    <div className={`${styles['avatar']}`} onClick={() => {
                        router.push('/userprofile')
                    }}>
                        <Image src={IMG_USER} alt='user' width={50} height={50}/>
                    </div>
                    <h3 className={`${styles['name']}`}>{userStore.getDisplayName()}</h3>

                    <div className={`${styles['profile']}`}>
                        <h4>Role:</h4>
                        <SwitchComp
                            checked={userStore.hasRole("user")}
                            title={{on: 'User', off: 'Provider'}}
                            handleOnChange={onSwitchRole}
                        /></div>
                    <div className={`${styles['profile']}`}>
                        <h4>Title:</h4>
                        {/*<p>Lorem Ipsum</p>*/}
                        <p>{userStore.profile?.title}</p>
                    </div>
                    <div className={`${styles['profile']}`}>
                        <h4>Function:</h4>
                        {/*<p>Lorem Ipsum</p>*/}
                        <p>{userStore.profile?.function}</p>

                    </div>
                    <div className={`${styles['profile']}`}>
                        <h4>Default Location:</h4>
                        <button type='button' onClick={() => setToggleLocationModal(true)}>
                            {globalStore.code}
                        </button>
                    </div>
                    <button type='button' onClick={() => {
                        userStore.logout()
                        router.push('/auth/sign-in')
                    }}>
                        LOG OUT
                    </button>
                </div>
            </div>
        </div>
    )
}

export default observer(User);