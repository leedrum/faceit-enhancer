/** @jsx h */
import { h } from 'dom-chef'
import {
  getRoomId,
  mapMatchNicknamesToPlayersMemoized
} from '../helpers/match-room'
import { getMatch, getSelf } from '../helpers/faceit-api'
import {
  hasFeatureAttribute,
  setFeatureAttribute
} from '../helpers/dom-element'
import {
  estimateRatingChangeMemoized,
  predictRatingChange
} from '../helpers/elo'
import storage from '../../shared/storage'

const FEATURE_ATTRIBUTE = 'elo-estimation'

const setText = (factionElm, changes, opponentAverageElo, eloDiff) => {
  const { gain, loss } = changes
  const eloElement = (
    <div
      style={{
        fontSize: '12px',
        textAlign: 'center',
        color: '#666',
        marginTop: '10px',
        textTransform: 'uppercase'
      }}
    >
      AVG ELO: {opponentAverageElo} / Diff:{' '}
      {eloDiff > 0 ? `+${eloDiff}` : eloDiff}
      <br />
      WIN: +{-loss} / LOSS: -{gain}
    </div>
  )
  factionElm.append(eloElement)
}

export const getFactionItem = async (team, factionName) => {
  const elos = team.roster.map(member => member.elo)
  const totalElo = elos.reduce((partialSum, a) => partialSum + a, 0)
  const averageElo = Math.round(totalElo / 5)
  const winProbability = team.stats.winProbability

  return {
    factionName,
    averageElo,
    winProbability
  }
}

export default async parent => {
  const roomId = getRoomId()
  const match = await getMatch(roomId)

  if (!parent) {
    return
  }
  // If (!match || match.state === 'FINISHED') {
  //   return
  // }

  const nicknamesToPlayers = mapMatchNicknamesToPlayersMemoized(match)
  const { matchRoomFocusMode } = await storage.getAll()
  const self = await getSelf()

  if (nicknamesToPlayers[self.nickname] && matchRoomFocusMode) {
    return
  }

  let factions = []

  factions.push(await getFactionItem(match.teams.faction1, 'faction1'))
  factions.push(await getFactionItem(match.teams.faction2, 'faction2'))

  factions = factions.filter(faction => Boolean(faction))

  if (factions.length !== 2) {
    return
  }

  parent = document.querySelector('#parasite-container').shadowRoot
  const factionNameElement1 = parent.querySelectorAll('h6')[1]

  const factionNameElement2 = parent.querySelectorAll('h6')[0]

  // Let eloElements = factions.map((faction, i) => {
  factions.filter((faction, i) => {
    const { factionName, averageElo } = faction

    if (
      (!factionNameElement2 ||
        hasFeatureAttribute(FEATURE_ATTRIBUTE, factionNameElement2)) &&
      (!factionNameElement1 ||
        hasFeatureAttribute(FEATURE_ATTRIBUTE, factionNameElement1))
    ) {
      return null
    }

    if (i === 0) setFeatureAttribute(FEATURE_ATTRIBUTE, factionNameElement1)
    if (i === 1) setFeatureAttribute(FEATURE_ATTRIBUTE, factionNameElement2)

    const opponentAverageElo = factions[1 - i].averageElo

    let gain
    let loss

    if (match.teams[factionName].stats) {
      const predicatedRatingChange = predictRatingChange(
        match.teams[factionName].stats.winProbability
      )

      gain = predicatedRatingChange.gain
      loss = predicatedRatingChange.loss
    } else {
      const estimatedRatingChange = estimateRatingChangeMemoized(
        averageElo,
        opponentAverageElo
      )

      gain = estimatedRatingChange.gain
      loss = estimatedRatingChange.loss
    }

    const eloDiff = averageElo - opponentAverageElo

    if (i === 0)
      setText(factionNameElement1, { gain, loss }, opponentAverageElo, eloDiff)
    if (i === 1)
      setText(factionNameElement2, { gain, loss }, opponentAverageElo, eloDiff)

    // Const factionIndex = i + 1
    // const scoreElement = select(
    //   isTeamV1Element
    //     ? `span[ng-bind="match.score${factionIndex}"]`
    //     : `span[ng-bind="vm.currentMatch.match.results.score.faction${factionIndex}"]`
    // )

    // if (scoreElement && !hasFeatureAttribute(FEATURE_ATTRIBUTE, scoreElement)) {
    //   setFeatureAttribute(FEATURE_ATTRIBUTE, scoreElement)

    //   const points = parseFloat(scoreElement.textContent) === 1 ? gain : loss

    //   const pointsElement = (
    //     <div className="text-lg">{points > 0 ? `+${points}` : points}</div>
    //   )

    //   setStyle(scoreElement, 'margin-top: -41px')
    //   scoreElement.append(pointsElement)
    // }

    // return eloElement
    return factions[i]
  })

  // EloElements = eloElements.filter(eloElement => Boolean(eloElement))

  // if (eloElements.length !== 2) {
  // }

  // const observer = new MutationObserver(() => {
  //   const firstResultElement = select('div[class*="MatchScore__Result"')

  //   if (!firstResultElement) {
  //     return
  //   }

  //   const result = firstResultElement.textContent

  //   if (result === 'W' || result === 'L') {
  //     eloElements.forEach(eloElement => {
  //       eloElement.remove()
  //     })
  //     observer.disconnect()
  //   }
  // })

  // Const matchResultElement = select('div[class*=VersusTeamStatus__Holder]')

  // observer.observe(matchResultElement, { childList: true, subtree: true })
}
