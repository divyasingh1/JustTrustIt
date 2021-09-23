

export const setToken =   token => {
    return localStorage.setItem('token', token?.toString());
};

export const setUser =  user => {
    try {
        const params = {
            username: user?.username,
            email: user?.email,
            publicKey:user?.publicKey,
            userId : user?.userId,
            createdAt: user?.createdAt,
        }
        return  localStorage.setItem('user', JSON.stringify(params));
    }
    catch (e)
    {
        alert(e?.toString());
    }

};
export const removeToken =  () => {
     localStorage.removeItem('token');
};

export const removeUser =  () => {
     localStorage.removeItem('user');
};

export const getToken =  () => {
    return localStorage.getItem('token');
};

export const getUser =  () => {
    const user =  localStorage.getItem('user');
    if(user && Object.values(user)?.length>0)
    {
        return JSON.parse(user);
    }
    return {};
};


