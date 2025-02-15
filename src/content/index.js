import select from 'select-dom'
import debounce from 'lodash/debounce'
import storage from '../shared/storage'
import * as modals from './helpers/modals'
import * as pages from './helpers/pages'
import { runFeatureIf } from './helpers/user-settings'
import { matchRoomIsReady } from './helpers/match-room'
import clickModalPartyInviteAccept from './features/click-modal-party-invite-accept'
import clickModalMatchQueuingContinue from './features/click-modal-match-queuing-continue'
import clickModalMatchReady from './features/click-modal-match-ready'
// Import addMatchRoomPlayerBadges from './features/add-match-room-player-badges'
// Import addMatchRoomPlayerColors from './features/add-match-room-player-colors'
// import addMatchRoomPlayerFlags from './features/add-match-room-player-flags'
// import addMatchRoomPlayerElos from './features/add-match-room-player-elos'
// import addMatchRoomPlayerStats from './features/add-match-room-player-stats'
import addMatchRoomEloEstimation from './features/add-match-room-elo-estimation'
// Import copyMatchRoomCopyServerData from './features/copy-match-room-copy-server-data'
// import clickMatchRoomConnectToServer from './features/click-match-room-connect-to-server'
import addHeaderLevelProgress from './features/add-header-level-progress'
import hideMatchRoomPlayerControls from './features/hide-match-room-player-controls'
import hideFaceitClientHasLandedBanner from './features/hide-faceit-client-has-landed-banner'
import addPlayerProfileMatchesElo from './features/add-player-profile-matches-elo'
// Import clickMatchRoomVetoLocations from './features/click-match-room-veto-locations'
// import clickMatchRoomVetoMaps from './features/click-match-room-veto-maps'
import clickModalMatchRoomCaptainOk from './features/click-modal-match-room-captain-ok'
import addPlayerProfileLevelProgress from './features/add-player-profile-level-progress'
// Import addMatchRoomPickPlayerStats from './features/add-match-room-pick-player-stats'
// import addMatchRoomPickPlayerElos from './features/add-match-room-pick-player-elos'
// import addMatchRoomPickPlayerFlags from './features/add-match-room-pick-player-flags'
// import addPlayerControlsReportFix from './features/add-match-room-player-controls-report-fix'
import addPlayerProfileMatchesDemo from './features/add-player-profile-matches-demo'
import addPlayerProfileExtendedStats from './features/add-player-profile-extended-stats'
import addPlayerProfileBadge from './features/add-player-profile-badge'
import addPlayerProfileBan from './features/add-player-profile-ban'
import clickModalClose from './features/click-modal-close'
import getBannedUser from './helpers/get-banned-user'
import stopToxicity from './features/stop-toxicity'
import clickModalInactiveCheck from './features/click-modal-inactive-check'
import addSidebarMatchesElo from './features/add-sidebar-matches-elo'
// Import addMatchRoomEloSelfResult from './features/add-match-room-elo-self-result'
// import applyMatchRoomFocusMode from './features/apply-match-room-focus-mode'
// import addMatchRoomPlayerLinks from './features/add-match-room-player-links'
import addPlayerProfileLinks from './features/add-player-profile-links'
import addTeamPlayerInfo from './features/add-team-player-info'

let checkedBan = false

const debouncedPlayerProfileStatsFeatures = debounce(async parentElement => {
  await runFeatureIf(
    'playerProfileLevelProgress',
    addPlayerProfileLevelProgress,
    parentElement
  )
  await addPlayerProfileMatchesDemo(parentElement)
  await addPlayerProfileMatchesElo(parentElement)
  await addPlayerProfileExtendedStats(parentElement)
}, 200)

function observeBody() {
  if (!checkedBan) {
    return
  }

  const observer = new MutationObserver(mutationList => {
    const modalContainer = select('#parasite-modal-container').shadowRoot
    if (modalContainer) {
      const reactModals = modalContainer.querySelectorAll(
        '.ReactModal__Content'
      )

      reactModals.forEach(modal => {
        if (modal.querySelector('h5')) {
          if (modals.isInviteToParty(modal)) {
            runFeatureIf(
              'partyAutoAcceptInvite',
              clickModalPartyInviteAccept,
              modal
            )
          }
        }
      })
    }

    const modalElement = select('.modal-dialog')

    if (modalElement) {
      if (modals.isMatchQueuing(modalElement)) {
        runFeatureIf(
          'matchQueueAutoReady',
          clickModalMatchQueuingContinue,
          modalElement
        )
      } else if (modals.isMatchReady(modalElement)) {
        runFeatureIf('matchQueueAutoReady', clickModalMatchReady, modalElement)
      } else if (modals.isMatchRoomCaptain(modalElement)) {
        runFeatureIf(
          ['matchRoomAutoVetoLocations', 'matchRoomAutoVetoMaps'],
          clickModalMatchRoomCaptainOk,
          modalElement
        )
      } else if (modals.isMatchVictory(modalElement)) {
        runFeatureIf('modalCloseMatchVictory', clickModalClose, modalElement)
      } else if (modals.isMatchDefeat(modalElement)) {
        runFeatureIf('modalCloseMatchDefeat', clickModalClose, modalElement)
      } else if (modals.isGlobalRankingUpdate(modalElement)) {
        runFeatureIf(
          'modalCloseGlobalRankingUpdate',
          clickModalClose,
          modalElement
        )
      } else if (modals.isInactive(modalElement)) {
        runFeatureIf(
          'modalClickInactiveCheck',
          clickModalInactiveCheck,
          modalElement
        )
      } else if (modals.isPlayerProfile()) {
        addPlayerProfileBadge(modalElement)
        addPlayerProfileLinks(modalElement)
        addPlayerProfileBan(modalElement)

        if (modals.isPlayerProfileStats()) {
          debouncedPlayerProfileStatsFeatures(modalElement)
        }
      }
    }

    runFeatureIf('headerShowElo', addHeaderLevelProgress)
    runFeatureIf(
      'hideFaceitClientHasLandedBanner',
      hideFaceitClientHasLandedBanner
    )

    addSidebarMatchesElo()

    const mainContentElement = select('#main-content')

    if (mainContentElement) {
      if (pages.isRoomOverview() && matchRoomIsReady()) {
        // AddMatchRoomPlayerBadges(mainContentElement)
        // addMatchRoomPlayerColors(mainContentElement)
        // addMatchRoomPlayerFlags(mainContentElement)
        // addMatchRoomPlayerElos(mainContentElement)
        // addMatchRoomPlayerLinks(mainContentElement)
        // runFeatureIf(
        //   'matchRoomHidePlayerControls',
        //   addPlayerControlsReportFix,
        //   mainContentElement
        // )
        // runFeatureIf(
        //   'matchRoomShowPlayerStats',
        //   addMatchRoomPlayerStats,
        //   mainContentElement
        // )
        addMatchRoomEloEstimation(mainContentElement)
        // AddMatchRoomEloSelfResult(mainContentElement)
        // runFeatureIf(
        //   'matchRoomAutoCopyServerData',
        //   copyMatchRoomCopyServerData,
        //   mainContentElement
        // )
        // runFeatureIf(
        //   'matchRoomAutoConnectToServer',
        //   clickMatchRoomConnectToServer,
        //   mainContentElement
        // )
        // runFeatureIf(
        //   'matchRoomAutoVetoLocations',
        //   clickMatchRoomVetoLocations,
        //   mainContentElement
        // )
        // runFeatureIf(
        //   'matchRoomAutoVetoMaps',
        //   clickMatchRoomVetoMaps,
        //   mainContentElement
        // )
        // addMatchRoomPickPlayerStats(mainContentElement)
        // addMatchRoomPickPlayerElos(mainContentElement)
        // addMatchRoomPickPlayerFlags(mainContentElement)
        // runFeatureIf(
        //   'matchRoomFocusMode',
        //   applyMatchRoomFocusMode,
        //   mainContentElement
        // )
      } else if (pages.isPlayerProfile()) {
        addPlayerProfileBadge(mainContentElement)
        addPlayerProfileLinks(mainContentElement)
        addPlayerProfileBan(mainContentElement)

        if (pages.isPlayerProfileStats()) {
          debouncedPlayerProfileStatsFeatures(mainContentElement)
        }
      } else if (pages.isTeamsOverview()) {
        runFeatureIf(
          'teamRosterPlayersInfo',
          addTeamPlayerInfo,
          mainContentElement
        )
      }
    }

    for (const mutation of mutationList) {
      for (const addedNode of mutation.addedNodes) {
        if (addedNode.shadowRoot) {
          observer.observe(addedNode.shadowRoot, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['aria-hidden']
          })
        }
      }
    }
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['aria-hidden']
  })
}

function runOnce() {
  if (!checkedBan) {
    return
  }

  runFeatureIf('matchRoomHidePlayerControls', hideMatchRoomPlayerControls)
}

;(async () => {
  const { extensionEnabled } = await storage.getAll()

  if (!extensionEnabled) {
    return
  }

  const bannedUser = await getBannedUser()
  checkedBan = true
  if (bannedUser) {
    stopToxicity(bannedUser)
    return
  }

  observeBody()
  runOnce()
})()
