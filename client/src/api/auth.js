
const API_URL = "http://localhost:3000/api/auth";

export async function loginRequest(email, password) {

    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
            email,
            password
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Login failed');
    }

    return data.user;

}

export async function getCurrentUserRequest() {
    const response = await fetch(`${API_URL}/me`, {
        credentials: 'include'
    });

    if (!response.status === 401) {
        return null;
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to load current user');
    }

    return data.user;
}

export async function registerRequest(firstName, lastName, email, password){
    const response =await fetch(`${API_URL}/register`,{
        method: 'POST',
        headers: {
            'Content-type':'application/json'
        },
        credentials:'include',
        body:JSON.stringify({
            firstName,
            lastName,
            email,
            password
        })
    });

    const data=await response.json();

    if(!response.ok){
        throw new Error(data.message || 'Registration failed')
    };

    return data.user;
}

export async function logoutRequest(){
    const response = await fetch(`${API_URL}/logout`,{
        method:'POST',
        credentials:'include'
    });

    if(!response.ok){
        throw new Error('Logout failed')
    };

}