import { useContext, useEffect, useState } from "react"
import axios from "axios";
import {UserContext} from "../App"
import { filterPaginationData } from "../common/filter-pagination-data";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import NoDataMessage from "../components/nodata.component";
import NotificationCard from "../components/notification-card.component";
import LoadMoreDataBtn from "../components/load-more.component";

const Notifications = () => {
    const [filter , setFilter] = useState('all')

    let filters = ['all' , 'like' , 'comment' , 'reply'];

    let { userAuth : {access_token} } = useContext(UserContext)

    const [notifications , setNotifications] = useState(null)
    
    const fetchNotifications = ({page , deletedDocCount = 0}) => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/notifications" , {
            page , filter , deletedDocCount
        } , {
            headers : {
                'Authorization' : `Bearer ${access_token}`
            }
        })
        .then(async ({data : {notifications : data}}) => {
            let formatedData = await filterPaginationData({
                state : notifications,
                data, page,
                countRoute : "/all-notifications-count",
                data_to_send : { filter } , 
                user : access_token
            })

            setNotifications(formatedData)

            console.log("ma aaya .then me")

            console.log(formatedData)
        })
        .catch(err => {
            console.log(err)
            console.log("m hun notification page.jsx me error")
        })
    }

    useEffect(() => {
        if(access_token){
            fetchNotifications({page : 1})
        }
    },[access_token , filter])

    const handleFilter = (e) => {
        let btn = e.target;
        setFilter(btn.innerHTML);

        setNotifications(null)

    }

    return (
        <div>
            <h1 className="max-md:hidden">Recent Notifications</h1>

            <div className="my-8 flex gap-6">

                {
                    filters.map((filterName , i) => {
                        return <button key={i} className={"py-2 " + (filter==filterName ? "btn-dark" : "btn-light")} onClick={handleFilter}>{filterName}</button>
                    })
                }

            </div>

            {
                notifications == null ? <Loader/> : 
                <>
                    {
                        notifications.results.length ? 
                            notifications.results.map((notification, i) => {
                                return <AnimationWrapper key={i} transition={{delay : i*0.08}}>
                                    <NotificationCard data={notification}
                                        index={i} notificationState={{
                                            notifications , setNotifications
                                        }}
                                    />
                                </AnimationWrapper>
                            })
                            : <NoDataMessage message="nothing available"/>
                    }
                    <LoadMoreDataBtn state={notifications} fetchDataFun={fetchNotifications} additionalParam = {{deletedDocCount : notifications.deletedDocCount}}/>
                </>

            }

        </div>
    )
}


export default Notifications