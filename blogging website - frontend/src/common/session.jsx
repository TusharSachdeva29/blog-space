const storeInSession = (key,value) => {
    sessionStorage.setItem(key,value);
}

const lookInSession = (key) =>{
    return sessionStorage.getItem(key);
}

const removeFromSession = (key) =>{
    return sessionStorage.getItem(key);
}

const logOutUser = (key) =>{
    return sessionStorage.getItem(key);
}

export {storeInSession,lookInSession,logOutUser,removeFromSession
}