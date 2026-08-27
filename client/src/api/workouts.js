
const API_URL="http://localhost:3000/api/workouts";

export async function getWorkoutsRequest(){

    const response = await fetch(API_URL,{
        credentials:'include'
    });

    const data= await response.json();

    if(!response.ok){
        throw new Error(data.message || 'Failed to load workouts')
    }

    return data.workouts;

}

export async function createWorkoutsRequest(workoutData){

    const response = await fetch(API_URL,{
        method:'POST',
        headers:{
            'Content-type':'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(workoutData),

    });

    const data= await response.json();

    if(!response.ok){
        throw new Error(data.message || 'Failed to create workout')
    }

    return data.workout;



}