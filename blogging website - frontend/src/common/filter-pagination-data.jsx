import axios from "axios"

export const filterPaginationData = async ({ create_new_array = false, state, data , page, countRoute, data_to_send = {} , user = undefined }) => {
    let obj;

    let headers = {}

    if(user){
        headers.headers = {
            'Authorization' : `Bearer ${user}`
        }
    }

    if(state!=null && !create_new_array){
        obj = {...state, results: [ ...state.results,...data], page: page}
    }
    else{
        await axios.post(import.meta.env.VITE_SERVER_DOMAIN + countRoute , data_to_send , headers)
        .then(({data : {totalDocs}}) => {
            obj = {results:data,page:1,totalDocs }
            console.log("ma ayaa")
            console.log(obj)
        })
        .catch(err => {
            console.error("Error:", err.response || err.message);
        });
        
    }
    return obj
}