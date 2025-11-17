let form = document.querySelector("#login")
const  emailRgx = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;


form.addEventListener("submit",(e) => {
    e.preventDefault();

    const data = new FormData(form)
    const cookies = document.cookie.split("=").toString().split(",")


    if (!emailRgx.test(data.get("Email"))) {
        alert("Please enter a valid email");
        return;
    }
    if (data.get("Password").trim() === "") {
        alert("Please enter a valid password");
        return;
    }

    if (data.get("RememberMe") === "on") {



        if(cookies.includes(data.get("Email").toString())) {

        }
        else
        {
        document.cookie =  `Email=${data.get("Email")}; max-age=604800`;
        document.cookie =  `Password=${data.get("Password")}; max-age=604800`;
        }
    }

    alert(`Welcome ${data.get("Email")}!`);


})