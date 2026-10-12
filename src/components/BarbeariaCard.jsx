
import './BarbeariaCard.css'

function BarbeariaCard({
    barbearia,
    selecionada = false,
    onSelecionar,
}) {
    return (
        <article
            id={`barbearia-${barbearia.id}`}
            className={`barbearia-card ${selecionada ? 'barbearia-card-selecionada' : ''}`}
            onClick={onSelecionar}
        >
            <div className="card-imagem-container">
                <img
                    src={barbearia.imagem}
                    alt={`Interior da ${barbearia.nome}`}
                    className="card-imagem"
                    loading="lazy"
                />

                <span className="card-avaliacao">
                    ★ {barbearia.avaliacao.toFixed(1)}
                </span>
            </div>

            <div className="card-conteudo">
                <p className="barbearia-localizacao">
                    <span aria-hidden="true">📍</span>
                    {barbearia.bairro}, {barbearia.cidade} - ES
                </p>

                <h3>{barbearia.nome}</h3>

                <p className="card-avaliacoes">
                    {barbearia.quantidadeAvaliacoes} avaliações
                </p>

                <div className="card-servicos">
                    {barbearia.servicos.map((servico) => (
                        <span key={servico}>{servico}</span>
                    ))}
                </div>

                <div className="card-rodape">
                    <p>
                        A partir de{' '}
                        <strong>
                            R$ {barbearia.precoInicial.toFixed(2).replace('.', ',')}
                        </strong>
                    </p>

                    <button
                        type="button"
                        className="botao-detalhes"
                        onClick={(evento) => {
                            evento.stopPropagation()
                            onSelecionar?.()
                        }}
                    >
                        Ver barbearia
                    </button>
                </div>
            </div>
        </article>
    )
}

export default BarbeariaCard
