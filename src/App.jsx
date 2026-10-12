
import { useState } from 'react'
import './App.css'
import BarbeariaCard from './components/BarbeariaCard'
import { barbearias } from './data/barbearias'

function App() {
  const [pesquisa, setPesquisa] = useState('')

  const resultados = barbearias.filter((barbearia) => {
    const termo = pesquisa.trim().toLowerCase()

    return (
      barbearia.nome.toLowerCase().includes(termo) ||
      barbearia.cidade.toLowerCase().includes(termo) ||
      barbearia.bairro.toLowerCase().includes(termo) ||
      barbearia.servicos.some((servico) =>
        servico.toLowerCase().includes(termo),
      )
    )
  })

  return (
    <div className="aplicacao">
      <header className="cabecalho">
        <a href="#inicio" className="marca">
          <span className="marca-icone">✂</span>
          <span>
            BARBER <strong>CONNECT</strong>
          </span>
        </a>

        <nav className="navegacao">
          <a href="#inicio">Início</a>
          <a href="#barbearias">Barbearias</a>
          <a href="#sobre">Sobre</a>
        </nav>

        <button
          className="botao-entrar"
          type="button"
          onClick={() => alert('A tela de login será criada posteriormente.')}
        >
          Entrar
        </button>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="hero-conteudo">
            <p className="sobretitulo">SEU ESTILO COMEÇA AQUI</p>

            <h1>
              Encontre sua próxima
              <span> barbearia favorita.</span>
            </h1>

            <p className="hero-descricao">
              Descubra barbearias, compare serviços e encontre
              o profissional ideal para o seu próximo corte.
            </p>

            <form
              className="form-pesquisa"
              onSubmit={(evento) => {
                evento.preventDefault()
                document
                  .getElementById('barbearias')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <span className="icone-pesquisa" aria-hidden="true">
                ⌕
              </span>

              <input
                type="search"
                placeholder="Nome, cidade, bairro ou serviço..."
                aria-label="Pesquisar barbearias por nome ou localização"
                value={pesquisa}
                onChange={(evento) => setPesquisa(evento.target.value)}
              />

              <button type="submit">Pesquisar</button>
            </form>

            <div className="hero-destaques">
              <span>✓ Encontre perto de você</span>
              <span>✓ Compare serviços e preços</span>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="hero-selo">
              <span>BARBER</span>
              <strong>CONNECT</strong>
              <div>ESTILO EM CADA DETALHE</div>
            </div>
          </div>
        </section>

        <section className="secao-barbearias" id="barbearias">
          <div className="secao-cabecalho">
            <div>
              <p className="sobretitulo">DESCUBRA NOVOS LUGARES</p>
              <h2>Barbearias em destaque</h2>
              <p className="secao-descricao">
                Encontre o lugar ideal para cuidar do seu estilo.
              </p>
            </div>

            <span className="contador-resultados">
              {resultados.length}{' '}
              {resultados.length === 1 ? 'resultado' : 'resultados'}
            </span>
          </div>

          {resultados.length > 0 ? (
            <div className="grade-barbearias">
              {resultados.map((barbearia) => (
                <BarbeariaCard
                  key={barbearia.id}
                  barbearia={barbearia}
                />
              ))}
            </div>
          ) : (
            <div className="estado-vazio">
              <span>⌕</span>
              <h3>Nenhuma barbearia encontrada</h3>
              <p>
                Experimente pesquisar por outra cidade, bairro ou serviço.
              </p>
              <button
                type="button"
                onClick={() => setPesquisa('')}
              >
                Limpar pesquisa
              </button>
            </div>
          )}
        </section>

        <section className="secao-proprietarios" id="sobre">
          <div>
            <p className="sobretitulo">VOCÊ TEM UMA BARBEARIA?</p>
            <h2>Seu próximo cliente pode estar aqui.</h2>
            <p>
              Cadastre seu estabelecimento na Barber Connect e
              apresente seus serviços a novos clientes.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              alert('O cadastro de barbearias será implementado depois.')
            }
          >
            Quero cadastrar minha barbearia
          </button>
        </section>
      </main>

      <footer className="rodape">
        <a href="#inicio" className="marca">
          <span className="marca-icone">✂</span>
          <span>
            BARBER <strong>CONNECT</strong>
          </span>
        </a>

        <p>Encontre seu estilo. Agende seu momento.</p>
        <span>Projeto acadêmico · Versão inicial</span>
      </footer>
    </div>
  )
}

export default App
