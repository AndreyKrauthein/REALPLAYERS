const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const connection = require("./database/database")
const bcrypt = require("bcryptjs")
const session = require("express-session")
const User = require("./user/User.js")


//session
app.use(session({
    secret: "qualquercoisa",
    cookie: {maxAge: 300000} //definindo o tempo do cookie em milisegundos (expiraçao da sessao)
}))


//view-engine
app.set('view engine', 'ejs')

//file - static
app.use(express.static("public"))

//body-parser
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

//database
connection
    .authenticate()
    .then(() => {
        console.log("Conexão feita com sucesso")
    }).catch((error) => {
        console.log("Conexão nao foi feita")
    })



//rotas
app.get("/", (req, res) => {
    if (req.session.user){
        res.render("authenticated")
    } else {
        res.render("unauthenticated")
    }
    
})

app.get("/user/register", (req, res) => {
    res.render("user/register.ejs")
})

app.post("/user/save", (req, res) => {
    let email = req.body.email
    let phone = req.body.phone
    let password = req.body.password

    //campos não informados
    if(email.length === 0){
        res.render("user/errors/inform_fields_register.ejs")
        return
    }

    if(phone.length === 0){
        res.render("user/errors/inform_fields_register.ejs")
        return
    }
    
    if(password.length === 0){
        res.render("user/errors/inform_fields_register.ejs")
        return
    }
    

    User.findOne({where: {email: email}}).then(user => {
        if(user == undefined){
            let salt = bcrypt.genSaltSync(10)
            let hash = bcrypt.hashSync(password, salt)
            User.create({
                email: email,
                password: hash,
                phone: phone
            })
            
            .then((user) => {
                req.session.user = {
                    id: user.id,
                    email: user.email
                }
                res.redirect("/")
            })
            
            .catch((err) => {
                res.render("user/errors/not_create.ejs")
                
            })
        } else {
            //email ja registrado
            res.render("user/errors/registered_email.ejs")
            return
        }

    })
    
})

app.get("/user/login", (req, res) => {
    res.render("user/login.ejs")
})


app.post("/user/authenticate", (req, res) => {
    let email = req.body.email
    let password = req.body.password

    if(email.length === 0){
        res.render("user/errors/inform_fields_login.ejs")
        return
    }
    
    if(password.length === 0){
        res.render("user/errors/inform_fields_login.ejs")
        return
    }

    User.findOne({where: {email: email}}).then(user => {
        if(user != undefined){ //Se existe um usuario com esse email
            //Validar senha
            let correct = bcrypt.compareSync(password, user.password)

            if(correct){
                req.session.user = {
                    id: user.id,
                    email: user.email
                }
                res.redirect("/")
            }else{
                res.render("user/errors/fields_incorrect.ejs")
            }

        }else{
            res.render("user/errors/not_found_email.ejs")
        }

    })


})


app.get("/user/logout", (req, res) => {
    req.session.user = undefined
    res.redirect("/")
})

app.listen((process.env.PORT || 5000), function(){
    console.log('listening on *:5000');
});
