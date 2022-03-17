const express = require("express");
const req = require("express/lib/request");
const app = express();
const bodyParser = require("body-parser");
const connection = require("./database/database");
const perguntaModel1 = require("./database/Pergunta");
const Pergunta = require("./database/Pergunta");
const Resposta = require("./database/Resposta");

//database

connection
    .authenticate()
    .then(() => {
        console.log("Conexão feita com o banco de dados")
    })
    .catch((msgErro) => {
        console.log(msgErro);
    })

//avisando ao express para ele usar o EJS como view engine
app.set('view engine', 'ejs');
//avisando ao expres que vamos usar arquivos estaticos nessa pasta public
app.use(express.static('public'));
//pega o get do formulario e converte ele para JS para tratamento
app.use(bodyParser.urlencoded({extended: false}))
//permite ler formulario em formato json
app.use(bodyParser.json());

//rotas
app.get("/", (req, res) => {
    Pergunta.findAll({ raw: true, order:[
        ['id', 'DESC'] 
    ] }).then(perguntas => {
        res.render("index",{
            perguntas: perguntas
        });
    })
    
});

app.get("/perguntas", (req, res) => {
    res.render("perguntar");
})

app.post("/salvarpergunta", (req, res) => {
    const titulo = req.body.titulo;
    const descricao = req.body.descricao;
    Pergunta.create({
        titulo: titulo,
        descricao: descricao
    }).then(() => {
        res.redirect("/");
    });
}); 

app.get("/pergunta/:id",(req, res) => {
    const id = req.params.id;
    Pergunta.findOne({
        where: {id: id}
    }).then(pergunta => {
        if(pergunta != undefined){

            Resposta.findAll({
                where:{perguntaId: pergunta.id},
                order: [
                    ['id', 'DESC']
                ]
            }).then(respostas => {
                res.render("pergunta",{
                    pergunta: pergunta,
                    respostas: respostas
                });
            });

        }else{
            res.redirect("/")
        }
    })
});

app.post("/responder",(req, res) => {
    const corpo = req.body.corpo;
    const perguntaId = req.body.pergunta;
    Resposta.create({
        corpo: corpo,
        perguntaId: perguntaId
    }).then(() => {
        res.redirect("/pergunta/" + perguntaId);
    })

});

app.listen(8080,() => {
    console.log("App rodando ")
})