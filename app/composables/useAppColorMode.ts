export function useAppColorMode() {
  const colorMode = useColorMode()

  const isDark = computed({
    get() {
      return colorMode.value === 'dark'
    },
    set(_isDark) {
      colorMode.preference = _isDark ? 'dark' : 'light'
    },
  })

  function toggle() {
    return isDark.value = !isDark.value
  }

  return {
    colorMode,
    isDark,
    toggle,
  }
}
