import select from 'select-dom'
import { notifyIf } from '../helpers/user-settings'

export default parent => {
  const acceptButton = select(
    'button[class="sc-clsHhM gYYSzb sc-fbkhIv hTGgtk"]',
    parent
  )

  if (acceptButton) {
    acceptButton.click()

    notifyIf('notifyPartyAutoAcceptInvite', {
      title: 'Party Invite Accepted',
      message: 'A party invite has been accepted.'
    })
  }
}
