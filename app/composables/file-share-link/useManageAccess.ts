import DialogManageAccess from '~/components/dialog/manageAccess/DialogManageAccess.vue'

export function useManageAccess() {
  const overlay = useOverlay()

  interface OpenDialogOption {
    fileId: string
    fileName: string
  }
  async function openDialog(option: OpenDialogOption) {
    const modal = overlay.create(DialogManageAccess, {
      destroyOnClose: true,
      props: option,
    })

    return modal.open()
  }

  return {
    openDialog,
  }
}
