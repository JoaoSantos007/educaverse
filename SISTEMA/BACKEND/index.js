const express = require('express')
const cors = require('cors')
const mysql = require('mysql2/promise')
const app = express()
app.use(cors())
app.use(express.json())
const crypto = require('crypto')
const conexao = require('./bd.js')
const porta = 3000

app.use(express.static('public'))

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
})

app.get("/login", (req, res) => {
    res.sendFile(__dirname + '/public/login.html')
})

app.get("/cadastro", (req, res) => {
    res.sendFile(__dirname + '/public/cadastro.html')
})

app.get("/contato", (req, res) => {
    res.sendFile(__dirname + '/public/contato.html')
})

app.get("/verificar-login", async (req, res) => {
    try {
        const { usuario_id } = req.query
        
        if (usuario_id) {
            let sql = 'SELECT nome, email FROM cadastro WHERE id = ?'
            let [resultado] = await conexao.query(sql, [usuario_id])
            
            if (resultado.length > 0) {
                return res.json({
                    "logado": true,
                    "usuario": {
                        "nome": resultado[0].nome,
                        "email": resultado[0].email
                    }
                })
            }
        }
        
        return res.json({
            "logado": false,
            "usuario": null
        })
        
    } catch (error) {
        console.log(error)
        return res.json({"resposta": "Erro no servidor"})
    }
})

app.post("/cadastro", async (req, res) => {
    try {
        const { nome, email } = req.body
        let { senha } = req.body

        senha = senha.trim()
        senha = senha.replace("⠀","")

        if (nome == "") {
            return res.json({"resposta":"Preencha o campo nome"})
        } else if (email == "") {
            return res.json({"resposta":"Preencha o campo email"})
        } else if (senha == "") {
            return res.json({"resposta":"Preencha o campo senha"})
        } else if (senha.length < 6) {
            return res.json({"resposta":"A senha tem que ter no minimo 6 caracteres"})
        }

        let sql = 'SELECT * FROM cadastro WHERE email = ?'
        let [resultado] = await conexao.query(sql,[email])
        if(resultado.length != 0){
            return res.json({"resposta": "email ja cadastrado"})
        }
        
        const hash = crypto.createHash("sha256").update(senha).digest("hex")

        sql = `INSERT INTO cadastro (nome, email, senha) VALUES (?,?,?)`
        let [resultado2] = await conexao.query(sql,[nome, email, hash])

        if(resultado2.affectedRows == 1){
            return res.json({"resposta":"cadastro efetuado com sucesso"})
        } else {
            return res.json({"resposta":"cadastro deu erro"})
        }
        
    } catch (error) {
        console.log(error)
        return res.json({"resposta":"Erro no servidor"})
    }
})

app.post("/login", async (req, res) => {
    try {
        const { email } = req.body
        let { senha } = req.body

        senha = senha.trim()
        senha = senha.replace("⠀","")

        if (email == "") {
            return res.json({"resposta":"Preencha o campo email"})
        } else if (senha == "") {
            return res.json({"resposta":"Preencha o campo senha"})
        }

        const hash = crypto.createHash("sha256").update(senha).digest("hex")

        const sql = `SELECT * FROM cadastro WHERE email = ? AND senha = ?`
        const [resultado] = await conexao.execute(sql,[email, hash])
        
        if(resultado.length == 1){
            const loginSql = `INSERT INTO login (email, senha) VALUES (?, ?)`
            await conexao.execute(loginSql, [email, hash])
            
            res.json({
                "resposta": "Login realizado com sucesso!",
                "usuario_id": resultado[0].id,
                "nome": resultado[0].nome
            })
        } else {
            res.json({"resposta":"Email ou senha inválidos"})
        }

    } catch (error) {
        console.log(error)
        res.json({"resposta":"Erro no servidor"})
    }
})

app.post("/contato", async (req, res) => {
    try {
        const { nome, email, assunto } = req.body

        if (nome == "") {
            return res.json({"resposta": "Preencha o campo nome"})
        } else if (email == "") {
            return res.json({"resposta": "Preencha o campo email"})
        } else if (assunto == "") {     
            return res.json({"resposta": "Preencha o campo assunto"})
        }

        let sql = `INSERT INTO contatos (nome_completo, email, assunto) VALUES (?, ?, ?)`
        let [resultado] = await conexao.query(sql, [nome, email, assunto])

        if (resultado.affectedRows == 1) {
            return res.json({"resposta": "Mensagem enviada com sucesso!"})
        } else {
            return res.json({"resposta": "Erro ao enviar mensagem"})
        }
        
    } catch (error) {
        console.log(error)
        return res.json({"resposta": "Erro no servidor"})
    }
})

app.listen(porta, () => {
    console.log(`servidor rodando em http://localhost:${porta}`)
})