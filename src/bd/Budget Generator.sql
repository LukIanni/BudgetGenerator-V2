CREATE TABLE USUARIO (
    id_usuario SERIAL PRIMARY KEY,
    nm_email_usuario VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    nm_usuario VARCHAR(100) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela SERVICO
CREATE TABLE SERVICO (
    id_servico SERIAL PRIMARY KEY,
    nome_servico VARCHAR(255) NOT NULL,
    materials TEXT,
    custo DECIMAL(10, 2) NOT NULL,
    lucro DECIMAL(5, 2) NOT NULL,
    resposta TEXT,
    id_usuario INT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario) ON DELETE CASCADE
);

-- Tabela PRODUTO
CREATE TABLE PRODUTO (
    id_produto SERIAL PRIMARY KEY,
    descricao TEXT NOT NULL,
    horas DECIMAL(5, 2),
    valor_hora DECIMAL(10, 2),
    custo_extra DECIMAL(10, 2) DEFAULT 0,
    resposta TEXT,
    id_usuario INT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario) ON DELETE CASCADE
);