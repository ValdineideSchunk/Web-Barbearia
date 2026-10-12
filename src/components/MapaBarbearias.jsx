
import { useEffect, useRef, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMap,
} from 'react-leaflet'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './MapaBarbearias.css'

import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Ícone padrão dos marcadores das barbearias
const iconePadrao = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Ícone vermelho da localização do usuário
const iconeUsuario = L.divIcon({
  className: 'icone-localizacao-usuario',
  html: `
    <div class="ponto-usuario">
      <div class="ponto-usuario-centro"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

L.Marker.prototype.options.icon = iconePadrao

// Formata a distância da rota para exibição
function formatarDistancia(distanciaMetros) {
  if (distanciaMetros < 1000) {
    return `${Math.round(distanciaMetros)} m`
  }

  return `${(distanciaMetros / 1000)
    .toFixed(1)
    .replace('.', ',')} km`
}

// Centraliza o mapa e informa quando a animação termina
function CentralizarMapa({
  posicao,
  onCentralizacaoConcluida,
}) {
  const mapa = useMap()
  const callbackRef = useRef(onCentralizacaoConcluida)

  useEffect(() => {
    callbackRef.current = onCentralizacaoConcluida
  }, [onCentralizacaoConcluida])

  useEffect(() => {
    if (!posicao) return

    const finalizarCentralizacao = () => {
      callbackRef.current?.()
    }

    mapa.once('moveend', finalizarCentralizacao)

    mapa.flyTo(posicao, 14, { duration: 0.8 })

    return () => {
      mapa.off('moveend', finalizarCentralizacao)
    }
  }, [mapa, posicao?.[0], posicao?.[1]])

  return null
}

function MapaBarbearias({
  barbearias = [],
  barbeariaSelecionadaId = null,
  onSelecionarBarbearia,
}) {
  const [localizacaoUsuario, setLocalizacaoUsuario] = useState(null)
  const [erroLocalizacao, setErroLocalizacao] = useState('')
  const [carregandoLocalizacao, setCarregandoLocalizacao] =
    useState(false)
  const [distancias, setDistancias] = useState({})
  const [carregandoDistancia, setCarregandoDistancia] =
    useState({})

  const marcadoresRef = useRef({})
  const consultasRef = useRef({})
  const solicitacaoLocalizacaoRef = useRef(false)

  const vitoria = [-20.3155, -40.3128]

  const barbeariaSelecionada = barbearias.find(
    (barbearia) => barbearia.id === barbeariaSelecionadaId,
  )

  const posicaoSelecionada = barbeariaSelecionada
    ? [
        barbeariaSelecionada.latitude,
        barbeariaSelecionada.longitude,
      ]
    : localizacaoUsuario

  // Finaliza o loading depois da animação de aproximação
  function finalizarCarregamentoLocalizacao() {
    if (solicitacaoLocalizacaoRef.current) {
      solicitacaoLocalizacaoRef.current = false
      setCarregandoLocalizacao(false)
    }
  }

  // Abre o popup quando a barbearia é selecionada pela lista
  useEffect(() => {
    if (barbeariaSelecionadaId == null) return

    const marcador = marcadoresRef.current[barbeariaSelecionadaId]

    if (marcador) {
      marcador.openPopup()
    }
  }, [barbeariaSelecionadaId, barbearias])

  // Obtém a localização atual do usuário
  function localizarUsuario() {
    setErroLocalizacao('')
    setCarregandoLocalizacao(true)
    solicitacaoLocalizacaoRef.current = true

    if (!navigator.geolocation) {
      setErroLocalizacao(
        'Seu navegador não oferece suporte à geolocalização.',
      )
      solicitacaoLocalizacaoRef.current = false
      setCarregandoLocalizacao(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (posicao) => {
        setLocalizacaoUsuario([
          posicao.coords.latitude,
          posicao.coords.longitude,
        ])
      },
      (erro) => {
        if (erro.code === erro.PERMISSION_DENIED) {
          setErroLocalizacao(
            'Permita o acesso à localização nas configurações do navegador.',
          )
        } else if (erro.code === erro.TIMEOUT) {
          setErroLocalizacao(
            'O tempo para obter sua localização acabou. Tente novamente.',
          )
        } else {
          setErroLocalizacao(
            'Não foi possível obter sua localização. Tente novamente.',
          )
        }

        solicitacaoLocalizacaoRef.current = false
        setCarregandoLocalizacao(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    )
  }

  // Calcula a distância pelas ruas quando o popup é aberto
  async function calcularDistanciaPelaRua(barbearia) {
    const id = barbearia.id

    if (!localizacaoUsuario) return
    if (consultasRef.current[id]) return
    if (distancias[id] !== undefined) return

    consultasRef.current[id] = true

    setCarregandoDistancia((estadoAtual) => ({
      ...estadoAtual,
      [id]: true,
    }))

    try {
      const [latitudeUsuario, longitudeUsuario] = localizacaoUsuario

      // A API OSRM recebe longitude antes da latitude
      const origem = `${longitudeUsuario},${latitudeUsuario}`
      const destino = `${barbearia.longitude},${barbearia.latitude}`

      const resposta = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${origem};${destino}?overview=false`,
      )

      if (!resposta.ok) {
        throw new Error('Não foi possível consultar a rota.')
      }

      const dados = await resposta.json()

      if (dados.code !== 'Ok' || !dados.routes?.length) {
        throw new Error('Nenhuma rota encontrada.')
      }

      setDistancias((estadoAtual) => ({
        ...estadoAtual,
        [id]: {
          valor: dados.routes[0].distance,
          erro: '',
        },
      }))
    } catch {
      setDistancias((estadoAtual) => ({
        ...estadoAtual,
        [id]: {
          valor: null,
          erro: 'Não foi possível calcular a distância pelas ruas.',
        },
      }))
    } finally {
      consultasRef.current[id] = false

      setCarregandoDistancia((estadoAtual) => ({
        ...estadoAtual,
        [id]: false,
      }))
    }
  }

  // Seleciona a barbearia e leva o usuário até o card
  function selecionarNoMapa(barbearia) {
    onSelecionarBarbearia?.(barbearia)

    document
      .getElementById(`barbearia-${barbearia.id}`)
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
  }

  return (
    <section className="mapa-secao">
      <div className="mapa-cabecalho">
        <div>
          <span className="texto-destaque">
            ENCONTRE POR PERTO
          </span>

          <h2>Barbearias próximas de você</h2>

          <p>Explore os estabelecimentos no mapa.</p>
        </div>

        <button
          type="button"
          className="botao-localizacao"
          onClick={localizarUsuario}
          disabled={carregandoLocalizacao}
        >
          {carregandoLocalizacao
            ? 'Localizando...'
            : 'Minha localização'}
        </button>
      </div>

      {erroLocalizacao && (
        <p role="alert" className="mapa-erro">
          {erroLocalizacao}
        </p>
      )}

      <div className="mapa-container">
        <MapContainer
          center={vitoria}
          zoom={12}
          scrollWheelZoom
          className="mapa-interativo"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <CentralizarMapa
            posicao={posicaoSelecionada}
            onCentralizacaoConcluida={
              finalizarCarregamentoLocalizacao
            }
          />

          {/* Marcadores das barbearias */}
          {barbearias.map((barbearia) => {
            if (
              !Number.isFinite(barbearia.latitude) ||
              !Number.isFinite(barbearia.longitude)
            ) {
              return null
            }

            const distancia = distancias[barbearia.id]
            const carregando = carregandoDistancia[barbearia.id]

            return (
              <Marker
                key={barbearia.id}
                position={[
                  barbearia.latitude,
                  barbearia.longitude,
                ]}
                eventHandlers={{
                  click: () => {
                    calcularDistanciaPelaRua(barbearia)
                  },
                }}
                ref={(marcador) => {
                  if (marcador) {
                    marcadoresRef.current[barbearia.id] = marcador
                  } else {
                    delete marcadoresRef.current[barbearia.id]
                  }
                }}
              >
                <Popup
                  eventHandlers={{
                    add: () => {
                      calcularDistanciaPelaRua(barbearia)
                    },
                  }}
                >
                  <strong>{barbearia.nome}</strong>
                  <br />

                  {barbearia.bairro}, {barbearia.cidade}
                  <br />

                  <strong>Distância pelas ruas:</strong>{' '}

                  {!localizacaoUsuario ? (
                    <span>
                      Ative "Minha localização" para calcular.
                    </span>
                  ) : carregando ? (
                    <span>Calculando distância...</span>
                  ) : distancia?.erro ? (
                    <span>{distancia.erro}</span>
                  ) : distancia?.valor != null ? (
                    <span>
                      {formatarDistancia(distancia.valor)}
                    </span>
                  ) : (
                    <span>Abra o marcador para calcular.</span>
                  )}

                  <br />

                  A partir de R${' '}
                  {Number(barbearia.precoInicial)
                    .toFixed(2)
                    .replace('.', ',')}
                  <br />

                  <button
                    type="button"
                    className="botao-ver-barbearia"
                    onClick={(evento) => {
                      evento.stopPropagation()
                      selecionarNoMapa(barbearia)
                    }}
                  >
                    Ver barbearia
                  </button>
                </Popup>
              </Marker>
            )
          })}

          {/* Localização do usuário */}
          {localizacaoUsuario && (
            <Marker
              position={localizacaoUsuario}
              icon={iconeUsuario}
              zIndexOffset={1000}
            >
              <Tooltip
                permanent
                direction="top"
                offset={[0, -12]}
                className="tooltip-localizacao-usuario"
              >
                Você está aqui
              </Tooltip>
            </Marker>
          )}
        </MapContainer>

        {/* Loading sobre o mapa */}
        {carregandoLocalizacao && (
          <div className="mapa-loading-overlay" role="status">
            <div className="mapa-loading-spinner"></div>

            <p>Localizando você...</p>

            <span>
              Aguarde enquanto encontramos sua localização.
            </span>
          </div>
        )}
      </div>
    </section>
  )
}

export default MapaBarbearias
