import axios from "axios"


const API_BASE_URL="http://localhost:3000/api/";

const apiClient= axios.create({
    baseURL:API_BASE_URL,
    withCredentials:true,

})


 //interceptors👉 It is a middle step that runs automatically before or after something happens
 
apiClient.interceptors.request.use(
  (config) => {    //config is an object (a box of data) that contains everything about your request.
    // Check if request data is FormData (file upload)
    if (config.data instanceof FormData) {
 } else {
      // For normal JSON requests
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);



apiClient.interceptors.response.use(
    (response)=>response,
    (error)=>{


        if(error.response?.status===401){
            console.error("unauthorized")
        }
        return Promise.reject(error)
    }
)


export default apiClient;