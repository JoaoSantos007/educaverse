const express = require('express')
const cors = require('cors')
const mysql = require('mysql2/promise')
const app = express()
app.use(cors())
app.use(express.json())
const crypto = require('crypto')
const conexao = require('./bd.js')
const porta = 3000

app.listen(porta, () => {
    console.log(`servidor rodando em http://localhost:${porta}`)
})

app.post("/contato", async (req,res)=>{
    try {

        const{nome, email, assunto} = req.body

        if (nome == "") {
            return res.json({"resposta":"Preencha o campo nome"})
        } else if (nome.length < 2) {
            return res.json({"resposta":"O nome deve ter pelo menos 2 caracteres"})
        } else if (email == "") {
            return res.json({"resposta":"Preencha o campo de email"})
        } else if (email.length < 6) {
            return res.json({"resposta":"Email muito curto"})
        } else if (!email.includes('@')) {
            return res.json({"resposta":"Email precisa ter @"})
        } else if (!email.includes('.')) {
            return res.json({"resposta":"Email precisa ter ponto"})
        } else if (assunto == "") {
            return res.json({"resposta":"Preencha o campo assunto"})
        } else if (assunto.length < 3) {
            return res.json({"resposta":"O assunto deve ter pelo menos 3 caracteres"})
        }

        let sql = `INSERT INTO contatos (nome_completo, email, assunto) VALUES (?,?,?)`

        let [resultado] = await conexao.query(sql,[nome, email, assunto])

        if(resultado.affectedRows == 1){
            return res.json({"resposta":"Mensagem enviada com sucesso!"})
        } else {
            return res.json({"resposta":"Erro ao enviar mensagem"})
        }
        

    } catch (error) {
        console.log(error)
        return res.json({"resposta":"Erro no servidor"})
    }
})