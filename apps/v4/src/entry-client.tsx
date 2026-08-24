import { installResumableLoader } from "@fictjs/runtime/experimental/loader"

import "./App"
import "./styles.css"
import { localizeRtlGallery, translateRtlValue, type RtlLanguage } from "./rtl-localization"

async function loadManifest(): Promise<void> {
  if (!import.meta.env.PROD) {
    return
  }

  try {
    const response = await fetch("/fict.manifest.json")
    if (!response.ok) {
      return
    }
    const manifest = await response.json()
    ;(globalThis as Record<string, unknown>).__FICT_MANIFEST__ = manifest
  } catch {
    return
  }
}

async function initResumableClient(): Promise<void> {
  wireColorModeManager()
  wireLayoutManager()
  wireSiteChrome()
  wireDocTabsFallback()
  wireDocPreviewCode()
  wireDocAccordions()
  wireDocAlertDialogs()
  wireDocAvatarMenus()
  wireDocButtonGroups()
  wireDocCalendars()
  wireDocCarousels()
  wireDocCharts()
  wireShowcaseSliders()
  wireShowcaseCounters()
  wireShowcaseMenus()
  wireRtlLocalization()
  wireShowcaseToggles()
  wireShowcaseMentions()
  wireShowcaseSelects()
  wireDashboardTables()
  wireTasksTables()
  wirePlaygroundControls()
  wireAuthenticationForm()
  wireColorFormatSelectors()
  wireShowcaseTooltips()
  wireBlockViewer()
  wireChartViewer()

  await loadManifest()
  installResumableLoader({
    document,
    events: ["click", "input", "change", "submit"],
    prefetch: {
      visibility: true,
      visibilityMargin: "200px",
      hover: true,
      hoverDelay: 50,
    },
  })

  wireThemeExperience()
  wireCreateRoute()
  wireClientFilters()
  document.documentElement.dataset.clientReady = "true"
}

function wireRtlLocalization(): void {
  document.querySelectorAll<HTMLElement>("[data-slot='rtl-components']").forEach((root) => {
    localizeRtlGallery(root, "ar")
  })

  document.addEventListener("click", (event) => {
    const target = event.target
    if (!(target instanceof Element)) {
      return
    }
    const option = target.closest<HTMLElement>("[data-rtl-language]")
    const language = option?.dataset.rtlLanguage as RtlLanguage | undefined
    const root = option?.closest<HTMLElement>("[data-slot='rtl-components']")
    if (!option || !root || (language !== "ar" && language !== "he")) {
      return
    }

    root.querySelectorAll<HTMLElement>("[data-rtl-language]").forEach((item) => {
      item.setAttribute("aria-selected", String(item === option))
    })
    const label = root.querySelector<HTMLElement>(".rtl-language-selector [data-menu-label-target]")
    const selectedLabel = option.querySelector<HTMLElement>(".ui-select-item-label")
    if (label && selectedLabel) {
      label.textContent = selectedLabel.textContent
    }
    localizeRtlGallery(root, language)
  })
}

function wireAuthenticationForm(): void {
  const setLoading = (scope: HTMLElement, loading: boolean): void => {
    const form = scope.querySelector<HTMLFormElement>("[data-auth-form]")
    if (!form) {
      return
    }
    form.dataset.authLoading = String(loading)
    form.setAttribute("aria-busy", String(loading))
    form.querySelectorAll<HTMLInputElement | HTMLButtonElement>("input, button").forEach((control) => {
      control.disabled = loading
    })
    const provider = scope.querySelector<HTMLButtonElement>("[data-auth-provider]")
    if (provider) {
      provider.disabled = loading
    }
    scope.querySelectorAll<HTMLElement>("[data-auth-spinner]").forEach((spinner) => {
      spinner.hidden = !loading
    })
    const providerIcon = scope.querySelector<HTMLElement>("[data-auth-provider-icon]")
    if (providerIcon) {
      providerIcon.hidden = loading
    }
  }

  document.addEventListener("submit", (event) => {
    const target = event.target
    if (!(target instanceof HTMLFormElement) || target.dataset.authForm === undefined) {
      return
    }
    event.preventDefault()
    const scope = target.closest<HTMLElement>(".auth-example")
    if (!scope || target.dataset.authLoading === "true") {
      return
    }

    setLoading(scope, true)
    window.setTimeout(() => {
      if (scope.isConnected) {
        setLoading(scope, false)
      }
    }, 3000)
  })
}

function wirePlaygroundControls(): void {
  let activeDialog: HTMLElement | null = null
  let activeDialogTrigger: HTMLElement | null = null

  const closePlaygroundDialog = (): void => {
    if (!activeDialog) {
      return
    }
    activeDialog.hidden = true
    activeDialogTrigger?.setAttribute("aria-expanded", "false")
    const trigger = activeDialogTrigger
    activeDialog = null
    activeDialogTrigger = null
    trigger?.focus()
  }

  const openPlaygroundDialog = (dialog: HTMLElement, trigger: HTMLElement): void => {
    closePlaygroundDialog()
    activeDialog = dialog
    const menu = trigger.closest<HTMLElement>("[data-menu]")
    activeDialogTrigger = menu?.querySelector<HTMLElement>(":scope > [data-menu-trigger]") ?? trigger
    dialog.hidden = false
    activeDialogTrigger.setAttribute("aria-expanded", "true")
    window.requestAnimationFrame(() => {
      const autofocus = dialog.querySelector<HTMLElement>("[autofocus]")
      const firstFocusable = dialog.querySelector<HTMLElement>("button, input, textarea, select, [tabindex]:not([tabindex='-1'])")
      ;(autofocus ?? firstFocusable)?.focus()
    })
  }

  const resetPresetSearch = (panel: HTMLElement): void => {
    const input = panel.querySelector<HTMLInputElement>("[data-playground-preset-search]")
    if (input) {
      input.value = ""
    }
    panel.querySelectorAll<HTMLElement>("[data-playground-preset-option]").forEach((option) => {
      option.hidden = false
    })
    const empty = panel.querySelector<HTMLElement>("[data-playground-preset-empty]")
    if (empty) {
      empty.hidden = true
    }
  }

  const setPlaygroundMode = (trigger: HTMLElement): void => {
    const mode = trigger.dataset.playgroundModeTrigger
    if (mode !== "complete" && mode !== "insert" && mode !== "edit") {
      return
    }
    const scope = trigger.closest<HTMLElement>(".playground-example")
    const editor = scope?.querySelector<HTMLElement>(".playground-editor-grid")
    if (!scope || !editor) {
      return
    }

    editor.dataset.mode = mode
    scope.querySelectorAll<HTMLElement>("[data-playground-mode-trigger]").forEach((tab) => {
      const active = tab.dataset.playgroundModeTrigger === mode
      tab.classList.toggle("playground-tab-active", active)
      tab.setAttribute("aria-selected", String(active))
      tab.tabIndex = active ? 0 : -1
    })
    editor.querySelectorAll<HTMLElement>("[data-playground-mode-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.playgroundModePanel !== mode
    })
  }

  document.addEventListener("input", (event) => {
    const target = event.target
    if (!(target instanceof HTMLInputElement) || target.dataset.playgroundPresetSearch === undefined) {
      return
    }

    const panel = target.closest<HTMLElement>("[data-menu-panel]")
    if (!panel) {
      return
    }

    const query = target.value.trim().toLowerCase()
    let visibleCount = 0
    panel.querySelectorAll<HTMLElement>("[data-playground-preset-option]").forEach((option) => {
      const matches = query === "" || (option.textContent?.toLowerCase() ?? "").includes(query)
      option.hidden = !matches
      if (matches) {
        visibleCount += 1
      }
    })

    const empty = panel.querySelector<HTMLElement>("[data-playground-preset-empty]")
    if (empty) {
      empty.hidden = visibleCount > 0
    }
  })

  const updateModelPeek = (option: HTMLElement): void => {
    const panel = option.closest<HTMLElement>("[data-menu-panel]")
    const peek = panel?.querySelector<HTMLElement>("[data-playground-model-peek]")
    if (!peek) {
      return
    }
    const title = peek.querySelector<HTMLElement>("h4")
    const description = peek.querySelector<HTMLElement>("[data-playground-model-description]")
    const strengths = peek.querySelector<HTMLElement>("[data-playground-model-strengths]")
    const strengthsWrap = peek.querySelector<HTMLElement>("[data-playground-model-strengths-wrap]")
    if (title) {
      title.textContent = option.dataset.menuValue ?? ""
    }
    if (description) {
      description.textContent = option.dataset.modelDescription ?? ""
    }
    const strengthsText = option.dataset.modelStrengths ?? ""
    if (strengths) {
      strengths.textContent = strengthsText
    }
    if (strengthsWrap) {
      strengthsWrap.hidden = strengthsText === ""
    }
  }

  document.addEventListener("input", (event) => {
    const target = event.target
    if (!(target instanceof HTMLInputElement) || target.dataset.playgroundModelSearch === undefined) {
      return
    }
    const panel = target.closest<HTMLElement>("[data-menu-panel]")
    if (!panel) {
      return
    }
    const query = target.value.trim().toLowerCase()
    let visibleCount = 0
    panel.querySelectorAll<HTMLElement>("[data-playground-model-group]").forEach((group) => {
      let groupVisibleCount = 0
      group.querySelectorAll<HTMLElement>("[data-playground-model-option]").forEach((option) => {
        const matches = query === "" || (option.textContent?.toLowerCase() ?? "").includes(query)
        option.hidden = !matches
        if (matches) {
          groupVisibleCount += 1
          visibleCount += 1
        }
      })
      group.hidden = groupVisibleCount === 0
    })
    const empty = panel.querySelector<HTMLElement>("[data-playground-model-empty]")
    if (empty) {
      empty.hidden = visibleCount > 0
    }
  })

  const handleModelPeek = (event: Event): void => {
    const target = event.target
    if (!(target instanceof Element)) {
      return
    }
    const option = target.closest<HTMLElement>("[data-playground-model-option]")
    if (option) {
      updateModelPeek(option)
    }
  }
  document.addEventListener("pointerover", handleModelPeek)
  document.addEventListener("focusin", handleModelPeek)

  document.addEventListener("click", (event) => {
    const target = event.target
    if (!(target instanceof Element)) {
      return
    }

    const modeTrigger = target.closest<HTMLElement>("[data-playground-mode-trigger]")
    if (modeTrigger) {
      event.preventDefault()
      setPlaygroundMode(modeTrigger)
      return
    }

    const dialogTrigger = target.closest<HTMLElement>("[data-playground-dialog-trigger]")
    if (dialogTrigger) {
      const dialogId = dialogTrigger.dataset.playgroundDialogTrigger
      const scope = dialogTrigger.closest<HTMLElement>(".playground-example")
      const dialog = scope?.querySelector<HTMLElement>(`[data-playground-dialog="${dialogId}"]`)
      if (dialog) {
        event.preventDefault()
        openPlaygroundDialog(dialog, dialogTrigger)
      }
      return
    }

    const shareCopy = target.closest<HTMLButtonElement>("[data-playground-share-copy]")
    if (shareCopy) {
      event.preventDefault()
      const input = shareCopy.parentElement?.querySelector<HTMLInputElement>("input")
      if (!input) {
        return
      }
      if (navigator.clipboard) {
        void navigator.clipboard.writeText(input.value)
      } else {
        input.select()
        document.execCommand("copy")
        input.setSelectionRange(0, 0)
      }
      shareCopy.setAttribute("aria-label", "Copied")
      const previousTimer = Number.parseInt(shareCopy.dataset.playgroundCopyTimer ?? "", 10)
      if (Number.isFinite(previousTimer)) {
        window.clearTimeout(previousTimer)
      }
      const timer = window.setTimeout(() => {
        shareCopy.setAttribute("aria-label", "Copy")
      }, 2000)
      shareCopy.dataset.playgroundCopyTimer = String(timer)
      return
    }

    const deleteConfirm = target.closest<HTMLButtonElement>("[data-playground-delete-confirm]")
    if (deleteConfirm) {
      event.preventDefault()
      const scope = deleteConfirm.closest<HTMLElement>(".playground-example")
      const region = scope?.querySelector<HTMLElement>("[data-playground-toast-region]")
      closePlaygroundDialog()
      if (region) {
        const toast = document.createElement("div")
        toast.className = "playground-toast"
        toast.textContent = "This preset has been deleted."
        region.replaceChildren(toast)
        const previousTimer = Number.parseInt(region.dataset.playgroundToastTimer ?? "", 10)
        if (Number.isFinite(previousTimer)) {
          window.clearTimeout(previousTimer)
        }
        const timer = window.setTimeout(() => {
          if (toast.isConnected) {
            toast.remove()
          }
        }, 3000)
        region.dataset.playgroundToastTimer = String(timer)
      }
      return
    }

    const dialogClose = target.closest<HTMLElement>("[data-playground-dialog-close]")
    if (dialogClose) {
      event.preventDefault()
      closePlaygroundDialog()
      return
    }

    const overlay = target.closest<HTMLElement>("[data-playground-dialog]")
    if (overlay && target === overlay) {
      closePlaygroundDialog()
      return
    }

    const option = target.closest<HTMLElement>("[data-playground-preset-option]")
    const panel = option?.closest<HTMLElement>("[data-menu-panel]")
    if (option && panel) {
      resetPresetSearch(panel)
    }

    const modelOption = target.closest<HTMLElement>("[data-playground-model-option]")
    const modelPanel = modelOption?.closest<HTMLElement>("[data-menu-panel]")
    if (modelOption && modelPanel) {
      updateModelPeek(modelOption)
      const input = modelPanel.querySelector<HTMLInputElement>("[data-playground-model-search]")
      if (input) {
        input.value = ""
      }
      modelPanel.querySelectorAll<HTMLElement>("[data-playground-model-group], [data-playground-model-option]").forEach((element) => {
        element.hidden = false
      })
      const empty = modelPanel.querySelector<HTMLElement>("[data-playground-model-empty]")
      if (empty) {
        empty.hidden = true
      }
    }
  })

  document.addEventListener("keydown", (event) => {
    const eventTarget = event.target
    const modeTrigger = eventTarget instanceof Element
      ? eventTarget.closest<HTMLElement>("[data-playground-mode-trigger]")
      : null
    if (modeTrigger && ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      const tabs = Array.from(
        modeTrigger.closest<HTMLElement>("[role='tablist']")
          ?.querySelectorAll<HTMLElement>("[data-playground-mode-trigger]") ?? [],
      )
      const currentIndex = tabs.indexOf(modeTrigger)
      let nextIndex = currentIndex
      if (event.key === "Home") {
        nextIndex = 0
      } else if (event.key === "End") {
        nextIndex = tabs.length - 1
      } else if (event.key === "ArrowRight") {
        nextIndex = (currentIndex + 1) % tabs.length
      } else if (event.key === "ArrowLeft") {
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length
      }
      const nextTab = tabs[nextIndex]
      if (nextTab) {
        event.preventDefault()
        setPlaygroundMode(nextTab)
        nextTab.focus()
      }
      return
    }

    if (!activeDialog) {
      return
    }
    if (event.key === "Escape") {
      event.preventDefault()
      closePlaygroundDialog()
      return
    }
    if (event.key !== "Tab") {
      return
    }
    const focusable = Array.from(activeDialog.querySelectorAll<HTMLElement>(
      "button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])",
    )).filter((element) => !element.hidden)
    if (focusable.length === 0) {
      return
    }
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  })
}

function wireDocTabsFallback(): void {
  document.addEventListener("click", (event) => {
    const target = event.target
    if (!(target instanceof Element)) {
      return
    }

    const button = target.closest(".doc-tab-button")
    if (!(button instanceof HTMLButtonElement)) {
      return
    }

    const tabsRoot = button.closest(".doc-tabs")
    if (!(tabsRoot instanceof HTMLElement)) {
      return
    }

    const nextPanelValue = button.dataset.panelValue
    if (!nextPanelValue) {
      return
    }

    tabsRoot.querySelectorAll<HTMLButtonElement>(".doc-tab-button").forEach((tabButton) => {
      const isActive = tabButton.dataset.panelValue === nextPanelValue
      tabButton.classList.toggle("doc-tab-button-active", isActive)
      tabButton.setAttribute("aria-selected", isActive ? "true" : "false")
    })

    tabsRoot.querySelectorAll<HTMLElement>(".doc-tab-panel-section").forEach((panelSection) => {
      panelSection.hidden = panelSection.dataset.panelValue !== nextPanelValue
    })
  })
}

function wireDocPreviewCode(): void {
  document.addEventListener("click", (event) => {
    const target = event.target
    if (!(target instanceof Element)) {
      return
    }

    const toggle = target.closest<HTMLButtonElement>("[data-doc-preview-code-toggle]")
    if (toggle) {
      const code = toggle.closest<HTMLElement>(".doc-component-code")
      const snippet = code?.querySelector<HTMLElement>(".doc-component-snippet")
      const fullCode = code?.querySelector<HTMLElement>("[data-doc-preview-full-code]")
      const copy = code?.querySelector<HTMLButtonElement>("[data-doc-preview-code-copy]")
      if (!code || !snippet || !fullCode || !copy) {
        return
      }

      code.dataset.docPreviewCodeExpanded = "true"
      toggle.setAttribute("aria-expanded", "true")
      toggle.hidden = true
      snippet.hidden = true
      fullCode.hidden = false
      copy.hidden = false
      return
    }

    const copy = target.closest<HTMLButtonElement>("[data-doc-preview-code-copy]")
    if (!copy) {
      return
    }

    const code = copy.closest<HTMLElement>(".doc-component-code")
      ?.querySelector<HTMLElement>("[data-doc-preview-full-code] code")
      ?.textContent
    if (!code || !navigator.clipboard) {
      return
    }

    void navigator.clipboard.writeText(code).then(() => {
      copy.textContent = "Copied"
      window.setTimeout(() => {
        if (copy.isConnected) {
          copy.textContent = "Copy"
        }
      }, 1200)
    })
  })
}

function wireDocAccordions(): void {
  const setItemState = (item: HTMLElement, open: boolean): void => {
    const trigger = item.querySelector<HTMLButtonElement>("[data-doc-accordion-trigger]")
    const content = item.querySelector<HTMLElement>("[data-slot='accordion-content']")
    const chevron = item.querySelector<SVGPathElement>("[data-doc-accordion-chevron]")
    if (!trigger || !content || !chevron) {
      return
    }

    const state = open ? "open" : "closed"
    item.dataset.state = state
    trigger.dataset.state = state
    trigger.setAttribute("aria-expanded", String(open))
    content.dataset.state = state
    content.hidden = !open
    chevron.setAttribute("d", open ? "m18 15-6-6-6 6" : "m6 9 6 6 6-6")
  }

  document.addEventListener("click", (event) => {
    const target = event.target
    if (!(target instanceof Element)) {
      return
    }

    const trigger = target.closest<HTMLButtonElement>("[data-doc-accordion-trigger]")
    if (!trigger || trigger.disabled) {
      return
    }

    const accordion = trigger.closest<HTMLElement>("[data-doc-accordion]")
    const item = trigger.closest<HTMLElement>("[data-slot='accordion-item']")
    if (!accordion || !item) {
      return
    }

    const shouldOpen = trigger.getAttribute("aria-expanded") !== "true"
    if (accordion.dataset.accordionType === "single" && shouldOpen) {
      for (const candidate of accordion.querySelectorAll<HTMLElement>("[data-slot='accordion-item']")) {
        if (candidate !== item) {
          setItemState(candidate, false)
        }
      }
    }
    setItemState(item, shouldOpen)
  })

  document.addEventListener("input", (event) => {
    const select = event.target
    if (!(select instanceof HTMLSelectElement) || !select.matches("[data-doc-rtl-language]")) {
      return
    }

    const language = select.value
    const shell = select.closest<HTMLElement>(".doc-rtl-preview-shell")
    const preview = shell?.querySelector<HTMLElement>(".doc-rtl-preview")
    const accordion = shell?.querySelector<HTMLElement>("[data-doc-accordion]")
    if (!shell || !preview || !["ar", "he", "en"].includes(language)) {
      return
    }

    const direction = language === "en" ? "ltr" : "rtl"
    preview.dir = direction
    preview.dataset.lang = language
    for (const directionalContent of shell.querySelectorAll<HTMLElement>("[data-doc-rtl-direction]")) {
      directionalContent.dir = direction
    }
    for (const text of shell.querySelectorAll<HTMLElement>("[data-doc-rtl-text]")) {
      const nextText = text.getAttribute(`data-text-${language}`)
      if (nextText) {
        text.textContent = nextText
      }
    }

    if (!accordion) {
      return
    }

    accordion.dir = direction

    const items = [...accordion.querySelectorAll<HTMLElement>("[data-slot='accordion-item']")]
    items.forEach((item, index) => {
      const label = item.querySelector<HTMLElement>("[data-doc-accordion-label]")
      const content = item.querySelector<HTMLElement>("[data-doc-accordion-content]")
      const nextLabel = label?.getAttribute(`data-label-${language}`)
      const nextContent = content?.getAttribute(`data-content-${language}`)
      if (label && nextLabel) {
        label.textContent = nextLabel
      }
      if (content && nextContent) {
        content.textContent = nextContent
      }
      setItemState(item, index === 0)
    })
  })
}

function wireDocAlertDialogs(): void {
  const origins = new WeakMap<HTMLElement, { parent: Node; nextSibling: ChildNode | null }>()
  let activePortal: HTMLElement | null = null
  let activeTrigger: HTMLButtonElement | null = null

  const closeDialog = (): void => {
    if (!activePortal) {
      return
    }

    const overlay = activePortal.querySelector<HTMLElement>("[data-slot='alert-dialog-overlay']")
    const content = activePortal.querySelector<HTMLElement>("[data-slot='alert-dialog-content']")
    if (overlay) {
      overlay.dataset.state = "closed"
    }
    if (content) {
      content.dataset.state = "closed"
    }
    activePortal.hidden = true

    const origin = origins.get(activePortal)
    if (origin) {
      origin.parent.insertBefore(activePortal, origin.nextSibling)
    }

    document.body.style.removeProperty("overflow")
    const trigger = activeTrigger
    activePortal = null
    activeTrigger = null
    trigger?.focus()
  }

  document.addEventListener("click", (event) => {
    const target = event.target
    if (!(target instanceof Element)) {
      return
    }

    const trigger = target.closest<HTMLButtonElement>("[data-doc-alert-dialog-trigger]")
    if (trigger) {
      const dialogId = trigger.dataset.docAlertDialogTrigger
      const portal = dialogId
        ? document.querySelector<HTMLElement>(`[data-doc-alert-dialog="${CSS.escape(dialogId)}"]`)
        : null
      if (!portal) {
        return
      }

      if (activePortal) {
        closeDialog()
      }
      origins.set(portal, { parent: portal.parentNode as Node, nextSibling: portal.nextSibling })
      document.body.append(portal)
      portal.hidden = false
      activePortal = portal
      activeTrigger = trigger
      document.body.style.overflow = "hidden"

      const overlay = portal.querySelector<HTMLElement>("[data-slot='alert-dialog-overlay']")
      const content = portal.querySelector<HTMLElement>("[data-slot='alert-dialog-content']")
      if (overlay) {
        overlay.dataset.state = "open"
      }
      if (content) {
        content.dataset.state = "open"
      }
      window.requestAnimationFrame(() => {
        portal.querySelector<HTMLButtonElement>("[data-slot='alert-dialog-cancel']")?.focus()
      })
      return
    }

    if (target.closest("[data-doc-alert-dialog-close]")) {
      closeDialog()
    }
  })

  document.addEventListener("keydown", (event) => {
    if (!activePortal) {
      return
    }
    if (event.key === "Escape") {
      event.preventDefault()
      closeDialog()
      return
    }
    if (event.key !== "Tab") {
      return
    }

    const focusable = [...activePortal.querySelectorAll<HTMLElement>("button:not([disabled])")]
    if (focusable.length === 0) {
      return
    }
    const currentIndex = focusable.indexOf(document.activeElement as HTMLElement)
    const nextIndex = event.shiftKey
      ? currentIndex <= 0
        ? focusable.length - 1
        : currentIndex - 1
      : currentIndex === focusable.length - 1
        ? 0
        : currentIndex + 1
    event.preventDefault()
    focusable[nextIndex]?.focus()
  })
}

function wireDocButtonGroups(): void {
  document.addEventListener("click", (event) => {
    const target = event.target
    if (!(target instanceof Element)) {
      return
    }

    const toggle = target.closest<HTMLButtonElement>("[data-doc-voice-toggle]")
    const group = toggle?.closest<HTMLElement>("[data-doc-voice-group]")
    const input = group?.querySelector<HTMLInputElement>("input")
    if (!toggle || !input) {
      return
    }

    const enabled = toggle.getAttribute("aria-pressed") !== "true"
    toggle.setAttribute("aria-pressed", enabled ? "true" : "false")
    input.disabled = enabled
    input.placeholder = enabled ? "Record and send audio..." : "Send a message..."
  })
}

function wireDocCalendars(): void {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const dateKey = (date: Date): string => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
  const persianDigits = (value: number): string => String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)])

  const applyRange = (calendar: HTMLElement): void => {
    const start = calendar.dataset.rangeStart
    const end = calendar.dataset.rangeEnd
    calendar.querySelectorAll<HTMLButtonElement>("[data-doc-calendar-day]").forEach((button) => {
      const value = button.dataset.date ?? ""
      const selected = start !== undefined && (end === undefined ? value === start : value >= start && value <= end)
      button.setAttribute("aria-selected", selected ? "true" : "false")
      button.classList.toggle("is-range-start", value === start)
      button.classList.toggle("is-range-end", end !== undefined && value === end)
      button.classList.toggle("is-range-middle", start !== undefined && end !== undefined && value > start && value < end)
    })
  }

  const refreshCalendar = (calendar: HTMLElement): void => {
    const baseYear = Number.parseInt(calendar.dataset.calendarYear ?? "", 10)
    const baseMonth = Number.parseInt(calendar.dataset.calendarMonth ?? "", 10)
    const variant = calendar.dataset.calendarVariant ?? "default"
    if (!Number.isFinite(baseYear) || !Number.isFinite(baseMonth)) return

    calendar.querySelectorAll<HTMLElement>(".doc-calendar-month").forEach((section, monthIndex) => {
      const normalized = new Date(baseYear, baseMonth + monthIndex, 1)
      const year = normalized.getFullYear()
      const month = normalized.getMonth()
      const firstDay = normalized.getDay()
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const previousDays = new Date(year, month, 0).getDate()
      const cellCount = variant === "hijri" ? 42 : Math.ceil((firstDay + daysInMonth) / 7) * 7
      const caption = section.querySelector<HTMLElement>("[data-doc-calendar-caption]")
      if (caption && variant !== "hijri") caption.textContent = `${monthNames[month]} ${year}`
      const monthSelect = section.querySelector<HTMLSelectElement>("[data-doc-calendar-month-select]")
      const yearSelect = section.querySelector<HTMLSelectElement>("[data-doc-calendar-year-select]")
      if (monthSelect) monthSelect.value = String(month)
      if (yearSelect) yearSelect.value = String(year)

      const grid = section.querySelector<HTMLElement>(".doc-calendar-grid")
      if (!grid) return
      grid.querySelectorAll("[data-doc-calendar-day], .doc-calendar-week-number").forEach((node) => node.remove())
      const fragment = document.createDocumentFragment()
      for (let index = 0; index < cellCount; index += 1) {
        if (grid.classList.contains("has-week-numbers") && index % 7 === 0) {
          const week = document.createElement("span")
          week.className = "doc-calendar-week-number"
          week.textContent = String(6 + index / 7).padStart(2, "0")
          fragment.append(week)
        }
        const raw = index - firstDay + 1
        const date = new Date(year, month, raw)
        const outside = raw < 1 || raw > daysInMonth
        const day = outside && raw < 1 ? previousDays + raw : outside ? raw - daysInMonth : raw
        const booked = variant === "booked" && !outside && day >= 12 && day <= 26
        const button = document.createElement("button")
        button.type = "button"
        button.className = `doc-calendar-day${outside ? " is-outside" : ""}${booked ? " is-booked" : ""}${!outside && date.toDateString() === new Date().toDateString() ? " is-today" : ""}`
        button.setAttribute("role", "gridcell")
        button.setAttribute("data-doc-calendar-day", "")
        button.dataset.day = String(day)
        button.dataset.date = dateKey(date)
        if (outside) button.dataset.outside = "true"
        button.setAttribute("aria-selected", calendar.dataset.selectedDate === button.dataset.date ? "true" : "false")
        button.disabled = booked
        button.append(variant === "hijri" ? persianDigits(day) : String(day))
        if (variant === "custom" && !outside) {
          const price = document.createElement("small")
          price.textContent = date.getDay() % 6 === 0 ? "$120" : "$100"
          button.append(price)
        }
        fragment.append(button)
      }
      grid.append(fragment)
    })
    if (calendar.dataset.calendarMode === "range") applyRange(calendar)
  }

  document.addEventListener("click", (event) => {
    const target = event.target
    if (!(target instanceof Element)) {
      return
    }

    const nav = target.closest<HTMLButtonElement>("[data-doc-calendar-nav]")
    const calendar = nav?.closest<HTMLElement>("[data-doc-calendar]")
    if (nav && calendar) {
      const current = new Date(Number(calendar.dataset.calendarYear), Number(calendar.dataset.calendarMonth), 1)
      current.setMonth(current.getMonth() + (nav.dataset.docCalendarNav === "next" ? 1 : -1))
      calendar.dataset.calendarYear = String(current.getFullYear())
      calendar.dataset.calendarMonth = String(current.getMonth())
      refreshCalendar(calendar)
      return
    }

    const day = target.closest<HTMLButtonElement>("[data-doc-calendar-day]")
    const dayCalendar = day?.closest<HTMLElement>("[data-doc-calendar]")
    if (day && dayCalendar && !day.disabled) {
      const value = day.dataset.date ?? ""
      const buttons = [...dayCalendar.querySelectorAll<HTMLButtonElement>("[data-doc-calendar-day]")]
      if (dayCalendar.dataset.calendarMode === "range") {
        const start = dayCalendar.dataset.rangeStart
        const end = dayCalendar.dataset.rangeEnd
        if (start === undefined || end !== undefined) {
          dayCalendar.dataset.rangeStart = value
          delete dayCalendar.dataset.rangeEnd
        } else {
          dayCalendar.dataset.rangeStart = value < start ? value : start
          dayCalendar.dataset.rangeEnd = value < start ? start : value
        }
        applyRange(dayCalendar)
      } else {
        dayCalendar.dataset.selectedDate = value
        buttons.forEach((button) => button.setAttribute("aria-selected", button === day ? "true" : "false"))
      }
      day.focus({ preventScroll: true })
      return
    }

    const preset = target.closest<HTMLButtonElement>("[data-doc-calendar-preset]")
    const presetCalendar = preset?.closest<HTMLElement>("[data-slot='card']")?.querySelector<HTMLElement>("[data-doc-calendar]")
    if (preset && presetCalendar) {
      const date = new Date()
      date.setDate(date.getDate() + Number(preset.dataset.docCalendarPreset))
      presetCalendar.dataset.calendarYear = String(date.getFullYear())
      presetCalendar.dataset.calendarMonth = String(date.getMonth())
      presetCalendar.dataset.selectedDate = dateKey(date)
      refreshCalendar(presetCalendar)
      presetCalendar.querySelectorAll<HTMLButtonElement>("[data-doc-calendar-day]").forEach((button) => button.setAttribute("aria-selected", button.dataset.date === dateKey(date) ? "true" : "false"))
    }
  })

  document.addEventListener("input", (event) => {
    const select = event.target
    if (!(select instanceof HTMLSelectElement)) {
      return
    }
    const calendar = select.closest<HTMLElement>("[data-doc-calendar]")
    if (!calendar) {
      return
    }
    if (select.dataset.docCalendarMonthSelect !== undefined) calendar.dataset.calendarMonth = select.value
    if (select.dataset.docCalendarYearSelect !== undefined) calendar.dataset.calendarYear = select.value
    refreshCalendar(calendar)
  })

  document.querySelectorAll<HTMLElement>("[data-doc-calendar]").forEach(refreshCalendar)
}

function wireDocCarousels(): void {
  const update = (carousel: HTMLElement, nextIndex: number): void => {
    const count = Number(carousel.dataset.carouselCount ?? "5")
    const variant = carousel.dataset.carouselVariant ?? "demo"
    const index = Math.max(0, Math.min(count - 1, nextIndex))
    const step = variant === "size" ? 133.328125 : variant === "spacing" ? 129.328125 : variant === "orientation" ? 135 : 336
    const track = carousel.querySelector<HTMLElement>(".doc-carousel-track")
    if (!track) return
    carousel.dataset.carouselIndex = String(index)
    const rtl = carousel.dir === "rtl" && variant !== "orientation"
    track.style.transform = variant === "orientation" ? `translate3d(0, ${-index * step}px, 0)` : `translate3d(${(rtl ? 1 : -1) * index * step}px, 0, 0)`
    carousel.querySelector<HTMLButtonElement>("[data-doc-carousel-previous]")!.disabled = index === 0
    carousel.querySelector<HTMLButtonElement>("[data-doc-carousel-next]")!.disabled = index === count - 1
    carousel.querySelectorAll<HTMLElement>("[data-slot='carousel-item']").forEach((item, itemIndex) => item.setAttribute("aria-hidden", itemIndex === index ? "false" : "true"))
    const status = carousel.parentElement?.querySelector<HTMLElement>("[data-doc-carousel-status]")
    if (status) status.textContent = `Slide ${index + 1} of ${count}`
  }

  document.querySelectorAll<HTMLElement>("[data-doc-carousel]").forEach((carousel) => {
    update(carousel, Number(carousel.dataset.carouselIndex ?? "0"))
    if (carousel.dataset.carouselVariant !== "plugin") return
    let timer: number | undefined
    const start = (): void => {
      window.clearInterval(timer)
      timer = window.setInterval(() => {
        const count = Number(carousel.dataset.carouselCount ?? "5")
        const index = Number(carousel.dataset.carouselIndex ?? "0")
        update(carousel, (index + 1) % count)
      }, 2000)
    }
    carousel.addEventListener("mouseenter", () => window.clearInterval(timer))
    carousel.addEventListener("mouseleave", start)
    start()
  })

  document.addEventListener("click", (event) => {
    const target = event.target
    if (!(target instanceof Element)) return
    const previous = target.closest<HTMLButtonElement>("[data-doc-carousel-previous]")
    const next = target.closest<HTMLButtonElement>("[data-doc-carousel-next]")
    const carousel = (previous ?? next)?.closest<HTMLElement>("[data-doc-carousel]")
    if (!carousel) return
    const index = Number(carousel.dataset.carouselIndex ?? "0")
    update(carousel, index + (next ? 1 : -1))
  })

  document.addEventListener("keydown", (event) => {
    const carousel = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-doc-carousel]") : null
    if (!carousel || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return
    const vertical = carousel.dataset.carouselVariant === "orientation"
    if ((vertical && !["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) || (!vertical && !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))) return
    event.preventDefault()
    const index = Number(carousel.dataset.carouselIndex ?? "0")
    const count = Number(carousel.dataset.carouselCount ?? "5")
    if (event.key === "Home") update(carousel, 0)
    else if (event.key === "End") update(carousel, count - 1)
    else {
      const forward = vertical ? event.key === "ArrowDown" : event.key === "ArrowRight" ? carousel.dir !== "rtl" : carousel.dir === "rtl"
      update(carousel, index + (forward ? 1 : -1))
    }
  })
}

function wireDocCharts(): void {
  const hide = (chart: HTMLElement): void => {
    const tooltip = chart.querySelector<HTMLElement>(".doc-chart-hover")
    if (tooltip) tooltip.hidden = true
  }

  document.addEventListener("pointerover", (event) => {
    const target = event.target
    if (!(target instanceof Element)) return
    const bar = target.closest<SVGGElement>("[data-doc-chart-bar]")
    const chart = bar?.closest<HTMLElement>("[data-doc-chart]")
    const tooltip = chart?.querySelector<HTMLElement>(".doc-chart-hover")
    if (!bar || !chart || !tooltip) return
    const desktop = bar.dataset.desktop ?? "0"
    const mobile = bar.dataset.mobile ?? "0"
    tooltip.replaceChildren()
    const title = document.createElement("strong")
    title.textContent = bar.dataset.label ?? "Visitors"
    tooltip.append(title)
    const desktopRow = document.createElement("span")
    desktopRow.innerHTML = `<em>Desktop</em><b>${desktop}</b>`
    tooltip.append(desktopRow)
    if (mobile !== "0") {
      const mobileRow = document.createElement("span")
      mobileRow.innerHTML = `<em>Mobile</em><b>${mobile}</b>`
      tooltip.append(mobileRow)
    }
    const rect = bar.getBoundingClientRect()
    tooltip.style.left = `${Math.round(rect.left + rect.width / 2 + 10)}px`
    tooltip.style.top = `${Math.round(rect.top + 10)}px`
    tooltip.hidden = false
  })

  document.addEventListener("pointerout", (event) => {
    const target = event.target
    if (!(target instanceof Element)) return
    const chart = target.closest<HTMLElement>("[data-doc-chart]")
    const related = event.relatedTarget
    if (chart && (!(related instanceof Node) || !chart.contains(related))) hide(chart)
  })

  document.addEventListener("click", (event) => {
    const target = event.target
    if (!(target instanceof Element)) return
    const series = target.closest<HTMLButtonElement>("[data-doc-chart-series]")
    const card = series?.closest<HTMLElement>(".doc-chart-demo-card")
    if (!series || !card) return
    const key = series.dataset.docChartSeries === "mobile" ? "Mobile" : "Desktop"
    card.querySelectorAll<HTMLButtonElement>("[data-doc-chart-series]").forEach((button) => button.setAttribute("aria-pressed", button === series ? "true" : "false"))
    card.querySelectorAll<SVGRectElement>("[data-doc-chart-value-desktop]").forEach((bar) => {
      const height = Number(bar.dataset[`docChartValue${key}`])
      bar.setAttribute("height", String(height))
      bar.setAttribute("y", String(219 - height))
    })
  })
}

function wireDocAvatarMenus(): void {
  let activeMenu: HTMLElement | null = null
  let activeTrigger: HTMLButtonElement | null = null
  let origin: { parent: Node; nextSibling: ChildNode | null } | null = null

  const closeMenu = (restoreFocus = false): void => {
    if (!activeMenu || !activeTrigger) {
      return
    }
    activeMenu.hidden = true
    activeMenu.style.removeProperty("position")
    activeMenu.style.removeProperty("top")
    activeMenu.style.removeProperty("left")
    activeTrigger.setAttribute("aria-expanded", "false")
    if (origin) {
      origin.parent.insertBefore(activeMenu, origin.nextSibling)
    }
    const trigger = activeTrigger
    activeMenu = null
    activeTrigger = null
    origin = null
    if (restoreFocus) {
      trigger.focus()
    }
  }

  document.addEventListener("click", (event) => {
    const target = event.target
    if (!(target instanceof Element)) {
      return
    }

    const trigger = target.closest<HTMLButtonElement>("[data-doc-avatar-menu-trigger]")
    if (trigger) {
      if (activeTrigger === trigger) {
        closeMenu(true)
        return
      }
      closeMenu()
      const menu = trigger.parentElement?.querySelector<HTMLElement>("[data-doc-avatar-menu]")
      if (!menu) {
        return
      }
      const rect = trigger.getBoundingClientRect()
      origin = { parent: menu.parentNode as Node, nextSibling: menu.nextSibling }
      document.body.append(menu)
      menu.hidden = false
      menu.style.position = "fixed"
      menu.style.top = `${rect.bottom + 6}px`
      menu.style.left = `${Math.max(8, rect.right - 128)}px`
      trigger.setAttribute("aria-expanded", "true")
      activeMenu = menu
      activeTrigger = trigger
      menu.querySelector<HTMLButtonElement>("[role='menuitem']")?.focus()
      return
    }

    if (activeMenu?.contains(target)) {
      if (target.closest("[role='menuitem']")) {
        closeMenu(true)
      }
      return
    }
    closeMenu()
  })

  document.addEventListener("keydown", (event) => {
    if (!activeMenu) {
      return
    }
    if (event.key === "Escape") {
      event.preventDefault()
      closeMenu(true)
      return
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
      return
    }
    const items = [...activeMenu.querySelectorAll<HTMLButtonElement>("[role='menuitem']")]
    const currentIndex = items.indexOf(document.activeElement as HTMLButtonElement)
    const nextIndex = event.key === "ArrowDown"
      ? (currentIndex + 1) % items.length
      : (currentIndex - 1 + items.length) % items.length
    event.preventDefault()
    items[nextIndex]?.focus()
  })
}

function wireShowcaseSliders(): void {
  const readNumber = (value: string | null | undefined, fallback: number): number => {
    const parsed = Number.parseFloat(value ?? "")
    return Number.isFinite(parsed) ? parsed : fallback
  }

  const syncSlider = (slider: HTMLElement): void => {
    const min = readNumber(slider.dataset.sliderMin, 0)
    const max = readNumber(slider.dataset.sliderMax, 100)
    const span = max - min || 1
    const thumbs = Array.from(slider.querySelectorAll<HTMLElement>("[data-slider-thumb]"))
    const values = thumbs.map((thumb) => readNumber(thumb.dataset.sliderValue, min))
    const scopeName = slider.dataset.slider
    const scope = scopeName
      ? document.querySelector<HTMLElement>(`[data-slider-scope="${scopeName}"]`)
      : slider.parentElement
    const isRtl = slider.dataset.sliderDirection === "rtl"

    const logicalPosition = (ratio: number): string => {
      const percent = ratio * 100
      const correction = 6 * (1 - ratio * 2)
      const operator = correction < 0 ? "-" : "+"
      return `calc(${percent}% ${operator} ${Math.abs(correction)}px)`
    }

    thumbs.forEach((thumb, index) => {
      const ratio = (values[index] - min) / span
      if (isRtl) {
        thumb.style.left = ""
        thumb.style.insetInlineStart = logicalPosition(ratio)
      } else {
        thumb.style.left = `${ratio * 100}%`
      }
      thumb.setAttribute("aria-valuenow", String(values[index]))
    })

    const range = slider.querySelector<HTMLElement>("[data-slider-range]")
    if (range) {
      const lowest = values.length > 1 ? Math.min(...values) : min
      const highest = Math.max(...values)
      const lowRatio = (lowest - min) / span
      const highRatio = (highest - min) / span
      if (isRtl) {
        range.style.left = ""
        range.style.right = ""
        range.style.insetInlineStart = logicalPosition(lowRatio)
        range.style.width = `calc(${(highRatio - lowRatio) * 100}% - ${(highRatio - lowRatio) * 12}px)`
      } else {
        range.style.left = `${lowRatio * 100}%`
        range.style.right = `${100 - highRatio * 100}%`
      }
    }

    if (scope) {
      scope.querySelectorAll<HTMLElement>("[data-slider-output]").forEach((output) => {
        const index = Number.parseInt(output.dataset.sliderOutput ?? "", 10)
        if (Number.isFinite(index) && values[index] !== undefined) {
          const language = slider.closest<HTMLElement>("[data-slot='rtl-components']")?.dataset.lang
          output.textContent = language === "ar"
            ? new Intl.NumberFormat("ar-SA", { useGrouping: false }).format(values[index])
            : String(values[index])
        }
      })
    }
  }

  const setThumbValue = (slider: HTMLElement, thumb: HTMLElement, rawValue: number): void => {
    const min = readNumber(slider.dataset.sliderMin, 0)
    const max = readNumber(slider.dataset.sliderMax, 100)
    const step = readNumber(slider.dataset.sliderStep, 1) || 1
    const thumbs = Array.from(slider.querySelectorAll<HTMLElement>("[data-slider-thumb]"))
    const index = thumbs.indexOf(thumb)
    const steps = Math.round((rawValue - min) / step)
    // Re-round at the step's own precision so fractional steps (0.1) do not
    // surface binary-float noise such as 0.30000000000000004 in the readout.
    const decimals = (String(step).split(".")[1] ?? "").length
    const stepped = Number((steps * step + min).toFixed(decimals))
    let lowerBound = min
    let upperBound = max

    if (index > 0) {
      lowerBound = readNumber(thumbs[index - 1].dataset.sliderValue, min)
    }
    if (index < thumbs.length - 1) {
      upperBound = readNumber(thumbs[index + 1].dataset.sliderValue, max)
    }

    thumb.dataset.sliderValue = String(Math.min(upperBound, Math.max(lowerBound, stepped)))
    syncSlider(slider)
  }

  const valueFromPointer = (slider: HTMLElement, clientX: number): number => {
    const min = readNumber(slider.dataset.sliderMin, 0)
    const max = readNumber(slider.dataset.sliderMax, 100)
    const rect = slider.getBoundingClientRect()
    const isRtl = slider.dataset.sliderDirection === "rtl"
    const ratio = rect.width > 0
      ? isRtl
        ? (rect.right - clientX - 6) / Math.max(1, rect.width - 12)
        : (clientX - rect.left) / rect.width
      : 0
    return min + Math.min(1, Math.max(0, ratio)) * (max - min)
  }

  document.addEventListener("pointerdown", (event) => {
    const target = event.target
    if (!(target instanceof Element)) {
      return
    }

    const slider = target.closest<HTMLElement>("[data-slider]")
    if (!slider) {
      return
    }

    const thumbs = Array.from(slider.querySelectorAll<HTMLElement>("[data-slider-thumb]"))
    if (thumbs.length === 0) {
      return
    }

    const pointerValue = valueFromPointer(slider, event.clientX)
    const directThumb = target.closest<HTMLElement>("[data-slider-thumb]")
    const activeThumb =
      directThumb ??
      thumbs.reduce((closest, thumb) => {
        const current = Math.abs(Number.parseFloat(thumb.dataset.sliderValue ?? "0") - pointerValue)
        const best = Math.abs(Number.parseFloat(closest.dataset.sliderValue ?? "0") - pointerValue)
        return current < best ? thumb : closest
      }, thumbs[0])

    event.preventDefault()
    activeThumb.focus()
    setThumbValue(slider, activeThumb, pointerValue)

    const onMove = (moveEvent: PointerEvent): void => {
      setThumbValue(slider, activeThumb, valueFromPointer(slider, moveEvent.clientX))
    }

    const onUp = (): void => {
      document.removeEventListener("pointermove", onMove)
      document.removeEventListener("pointerup", onUp)
      document.removeEventListener("pointercancel", onUp)
    }

    document.addEventListener("pointermove", onMove)
    document.addEventListener("pointerup", onUp)
    document.addEventListener("pointercancel", onUp)
  })

  document.addEventListener("keydown", (event) => {
    const target = event.target
    if (!(target instanceof HTMLElement)) {
      return
    }

    const thumb = target.closest<HTMLElement>("[data-slider-thumb]")
    const slider = thumb?.closest<HTMLElement>("[data-slider]")
    if (!thumb || !slider) {
      return
    }

    const step = readNumber(slider.dataset.sliderStep, 1) || 1
    const current = readNumber(thumb.dataset.sliderValue, 0)
    const horizontalStep = slider.dataset.sliderDirection === "rtl" ? -step : step
    const deltas: Record<string, number> = {
      ArrowRight: horizontalStep,
      ArrowUp: step,
      ArrowLeft: -horizontalStep,
      ArrowDown: -step,
      PageUp: step * 10,
      PageDown: step * -10,
    }

    if (event.key === "Home") {
      event.preventDefault()
      setThumbValue(slider, thumb, readNumber(slider.dataset.sliderMin, 0))
      return
    }

    if (event.key === "End") {
      event.preventDefault()
      setThumbValue(slider, thumb, readNumber(slider.dataset.sliderMax, 100))
      return
    }

    const delta = deltas[event.key]
    if (delta === undefined) {
      return
    }

    event.preventDefault()
    setThumbValue(slider, thumb, current + delta)
  })

  document.querySelectorAll<HTMLElement>("[data-slider]").forEach(syncSlider)
}

function wireShowcaseCounters(): void {
  const clampCounter = (group: HTMLElement, rawValue: number): number => {
    const min = Number.parseInt(group.dataset.counterMin ?? "", 10)
    const max = Number.parseInt(group.dataset.counterMax ?? "", 10)
    let next = rawValue
    if (Number.isFinite(min)) {
      next = Math.max(min, next)
    }
    if (Number.isFinite(max)) {
      next = Math.min(max, next)
    }
    return next
  }

  const syncCounter = (group: HTMLElement): void => {
    const input = group.querySelector<HTMLInputElement>("[data-counter-input]")
    if (!input) {
      return
    }

    const min = Number.parseInt(group.dataset.counterMin ?? "", 10)
    const max = Number.parseInt(group.dataset.counterMax ?? "", 10)
    const current = Number.parseInt(input.value, 10)

    group.querySelectorAll<HTMLButtonElement>("[data-counter-step]").forEach((button) => {
      const step = Number.parseInt(button.dataset.counterStep ?? "0", 10) || 0
      const next = current + step
      button.disabled =
        (Number.isFinite(min) && next < min) || (Number.isFinite(max) && next > max)
    })
  }

  document.addEventListener("click", (event) => {
    const target = event.target
    if (!(target instanceof Element)) {
      return
    }

    const button = target.closest<HTMLButtonElement>("[data-counter-step]")
    const group = button?.closest<HTMLElement>("[data-counter]")
    const input = group?.querySelector<HTMLInputElement>("[data-counter-input]")
    if (!button || !group || !input) {
      return
    }

    const step = Number.parseInt(button.dataset.counterStep ?? "0", 10) || 0
    const current = Number.parseInt(input.value, 10)
    input.value = String(clampCounter(group, (Number.isFinite(current) ? current : 0) + step))
    syncCounter(group)
  })

  document.addEventListener("input", (event) => {
    const target = event.target
    if (!(target instanceof HTMLInputElement) || target.dataset.counterInput === undefined) {
      return
    }

    const group = target.closest<HTMLElement>("[data-counter]")
    if (!group) {
      return
    }

    target.value = target.value.replace(/[^0-9]/g, "")
    syncCounter(group)
  })

  document.addEventListener(
    "blur",
    (event) => {
      const target = event.target
      if (!(target instanceof HTMLInputElement) || target.dataset.counterInput === undefined) {
        return
      }

      const group = target.closest<HTMLElement>("[data-counter]")
      if (!group) {
        return
      }

      const parsed = Number.parseInt(target.value, 10)
      target.value = String(clampCounter(group, Number.isFinite(parsed) ? parsed : 1))
      syncCounter(group)
    },
    true,
  )

  document.querySelectorAll<HTMLElement>("[data-counter]").forEach(syncCounter)
}

function closeShowcaseMenus(except?: Element | null): void {
  document.querySelectorAll<HTMLElement>("[data-menu]").forEach((menu) => {
    if (except && (menu === except || menu.contains(except))) {
      return
    }

    const panel = menu.querySelector<HTMLElement>(":scope > [data-menu-panel]")
    const trigger = menu.querySelector<HTMLElement>(":scope > [data-menu-trigger]")
    if (panel) {
      panel.hidden = true
    }
    if (trigger) {
      trigger.setAttribute("aria-expanded", "false")
    }
  })
}

function positionShowcaseMenu(panel: HTMLElement): void {
  const preferredSide = panel.dataset.menuPreferredSide ?? panel.dataset.menuSide ?? "bottom"
  const preferredAlign = panel.dataset.menuPreferredAlign ?? panel.dataset.menuAlign ?? "start"

  panel.dataset.menuPreferredSide = preferredSide
  panel.dataset.menuPreferredAlign = preferredAlign
  panel.dataset.menuSide = preferredSide
  panel.dataset.menuAlign = preferredAlign

  const margin = 8
  let rect = panel.getBoundingClientRect()

  if (preferredSide === "bottom" && rect.bottom > window.innerHeight - margin) {
    panel.dataset.menuSide = "top"
  } else if (preferredSide === "top" && rect.top < margin) {
    panel.dataset.menuSide = "bottom"
  } else if (preferredSide === "right" && rect.right > window.innerWidth - margin) {
    panel.dataset.menuSide = "left"
  } else if (preferredSide === "left" && rect.left < margin) {
    panel.dataset.menuSide = "right"
  }

  if (panel.dataset.menuSide === "left" || panel.dataset.menuSide === "right") {
    return
  }

  rect = panel.getBoundingClientRect()

  if (preferredAlign === "start" && rect.right > window.innerWidth - margin) {
    panel.dataset.menuAlign = "end"
  } else if (preferredAlign === "end" && rect.left < margin) {
    panel.dataset.menuAlign = "start"
  }
}

function wireShowcaseMenus(): void {
  const submenuOpenTimers = new WeakMap<HTMLElement, number>()
  const submenuCloseTimers = new WeakMap<HTMLElement, number>()

  const clearSubmenuTimer = (
    timers: WeakMap<HTMLElement, number>,
    menu: HTMLElement,
  ): void => {
    const timer = timers.get(menu)
    if (timer !== undefined) {
      window.clearTimeout(timer)
      timers.delete(menu)
    }
  }

  const setMenuOpen = (menu: HTMLElement, open: boolean): void => {
    const panel = menu.querySelector<HTMLElement>(":scope > [data-menu-panel]")
    const trigger = menu.querySelector<HTMLElement>(":scope > [data-menu-trigger]")
    if (!panel || !trigger) {
      return
    }

    if (!open) {
      panel.hidden = true
      trigger.setAttribute("aria-expanded", "false")
      return
    }

    closeShowcaseMenus(menu)
    panel.hidden = false
    trigger.setAttribute("aria-expanded", "true")
    positionShowcaseMenu(panel)
    panel.dispatchEvent(new CustomEvent("showcase-menu-open", { bubbles: true }))
    if (menu.dataset.docBreadcrumbMenu !== undefined || menu.matches(".doc-button-menu")) {
      queueMicrotask(() => panel.querySelector<HTMLElement>("[data-menu-item]")?.focus({ preventScroll: true }))
    }
  }

  document.querySelectorAll<HTMLElement>(".ui-menu-sub[data-menu]").forEach((submenu) => {
    submenu.addEventListener("pointerenter", (event) => {
      if (event.pointerType !== "mouse") {
        return
      }

      clearSubmenuTimer(submenuCloseTimers, submenu)
      clearSubmenuTimer(submenuOpenTimers, submenu)
      submenuOpenTimers.set(submenu, window.setTimeout(() => {
        submenuOpenTimers.delete(submenu)
        if (submenu.matches(":hover") && submenu.getClientRects().length > 0) {
          submenu
            .querySelector<HTMLElement>(":scope > [data-menu-trigger]")
            ?.focus({ preventScroll: true })
          setMenuOpen(submenu, true)
        }
      }, 100))
    })

    submenu.addEventListener("pointerleave", (event) => {
      if (event.pointerType !== "mouse") {
        return
      }

      clearSubmenuTimer(submenuOpenTimers, submenu)
      clearSubmenuTimer(submenuCloseTimers, submenu)
      submenuCloseTimers.set(submenu, window.setTimeout(() => {
        submenuCloseTimers.delete(submenu)
        if (!submenu.matches(":hover")) {
          setMenuOpen(submenu, false)
        }
      }, 100))
    })
  })

  document.addEventListener("click", (event) => {
    const target = event.target
    if (!(target instanceof Element)) {
      closeShowcaseMenus()
      return
    }

    const trigger = target.closest<HTMLElement>("[data-menu-trigger]")
    if (trigger) {
      const menu = trigger.closest<HTMLElement>("[data-menu]")
      const panel = menu?.querySelector<HTMLElement>(":scope > [data-menu-panel]")
      if (!menu || !panel) {
        return
      }

      event.preventDefault()
      clearSubmenuTimer(submenuOpenTimers, menu)
      clearSubmenuTimer(submenuCloseTimers, menu)
      setMenuOpen(menu, menu.matches(".ui-menu-sub") || panel.hidden)
      return
    }

    const item = target.closest<HTMLElement>("[data-menu-item]")
    if (item) {
      const menu = item.closest<HTMLElement>("[data-menu]")
      if (!menu) {
        return
      }

      event.preventDefault()

      if (item.dataset.menuTrigger !== undefined) {
        return
      }

      if (item.dataset.menuValue !== undefined) {
        menu.querySelectorAll<HTMLElement>("[data-menu-item]").forEach((sibling) => {
          if (sibling.dataset.menuValue !== undefined) {
            const selected = sibling === item
            sibling.dataset.selected = selected ? "true" : "false"
            if (sibling.getAttribute("role") === "option") {
              sibling.setAttribute("aria-selected", selected ? "true" : "false")
            }
          }
        })

        const label = menu.querySelector<HTMLElement>("[data-menu-label-target]")
        if (label) {
          label.textContent = item.dataset.menuValue ?? label.textContent
        }
      }

      if (item.dataset.menuKeepOpen === undefined) {
        closeShowcaseMenus()
      }
      return
    }

    if (!target.closest("[data-menu-panel]")) {
      closeShowcaseMenus()
    }
  })

  document.addEventListener("submit", (event) => {
    const form = event.target
    if (!(form instanceof HTMLFormElement) || form.dataset.dashboardValueForm === undefined) {
      return
    }

    event.preventDefault()
    const dashboard = form.closest<HTMLElement>(".dashboard-example")
    const region = dashboard?.querySelector<HTMLElement>("[data-dashboard-toast-region]")
    if (!region) {
      return
    }

    const previousDoneTimer = Number.parseInt(region.dataset.dashboardToastDoneTimer ?? "", 10)
    const previousDismissTimer = Number.parseInt(region.dataset.dashboardToastDismissTimer ?? "", 10)
    if (Number.isFinite(previousDoneTimer)) {
      window.clearTimeout(previousDoneTimer)
    }
    if (Number.isFinite(previousDismissTimer)) {
      window.clearTimeout(previousDismissTimer)
    }

    const toast = document.createElement("div")
    toast.className = "dashboard-toast"
    toast.dataset.state = "loading"
    const icon = document.createElement("span")
    icon.className = "dashboard-toast-icon"
    icon.setAttribute("aria-hidden", "true")
    const message = document.createElement("span")
    message.className = "dashboard-toast-message"
    message.textContent = `Saving ${form.dataset.dashboardRowHeader ?? "section"}`
    toast.append(icon, message)
    region.replaceChildren(toast)

    const doneTimer = window.setTimeout(() => {
      toast.dataset.state = "success"
      icon.textContent = "✓"
      message.textContent = "Done"
      const dismissTimer = window.setTimeout(() => {
        if (toast.isConnected) {
          toast.remove()
        }
      }, 2500)
      region.dataset.dashboardToastDismissTimer = String(dismissTimer)
    }, 1000)
    region.dataset.dashboardToastDoneTimer = String(doneTimer)
  })

  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      const activeItem = document.activeElement instanceof HTMLElement
        ? document.activeElement.closest<HTMLElement>("[data-doc-breadcrumb-menu] [data-menu-item], .doc-button-menu [data-menu-item]")
        : null
      const panel = activeItem?.closest<HTMLElement>("[data-menu-panel]")
      if (activeItem && panel) {
        const items = [...panel.querySelectorAll<HTMLElement>("[data-menu-item]")]
        const currentIndex = items.indexOf(activeItem)
        const delta = event.key === "ArrowDown" ? 1 : -1
        items[(currentIndex + delta + items.length) % items.length]?.focus({ preventScroll: true })
        event.preventDefault()
        return
      }
    }

    if (event.key === "Escape") {
      const openBreadcrumbMenu = [...document.querySelectorAll<HTMLElement>("[data-doc-breadcrumb-menu], .doc-button-menu")]
        .find((menu) => !menu.querySelector<HTMLElement>(":scope > [data-menu-panel]")?.hidden)
      const trigger = openBreadcrumbMenu?.querySelector<HTMLElement>(":scope > [data-menu-trigger]")
      closeShowcaseMenus()
      trigger?.focus({ preventScroll: true })
    }
  })
}

function wireShowcaseToggles(): void {
  const selectRadioItem = (radioItem: HTMLElement, focus = false): void => {
    const group = radioItem.closest<HTMLElement>("[data-radio-group]")
    if (!group) {
      return
    }

    group.querySelectorAll<HTMLElement>("[data-radio-item]").forEach((item) => {
      const checked = item === radioItem
      item.dataset.checked = checked ? "true" : "false"
      item.querySelectorAll<HTMLElement>(".ui-radio").forEach((radio) => {
        radio.dataset.checked = checked ? "true" : "false"
        radio.setAttribute("aria-checked", checked ? "true" : "false")
        radio.tabIndex = checked ? 0 : -1
        if (checked && focus) {
          radio.focus()
        }
      })
    })
  }

  const toggleHearOption = (hearOption: HTMLElement, focus = false): void => {
    const checked = hearOption.dataset.checked !== "true"
    hearOption.dataset.checked = checked ? "true" : "false"
    hearOption.querySelectorAll<HTMLElement>(".ui-checkbox").forEach((box) => {
      box.dataset.checked = checked ? "true" : "false"
      box.setAttribute("aria-checked", checked ? "true" : "false")
      if (focus) {
        box.focus()
      }
    })
  }

  document.addEventListener("click", (event) => {
    const target = event.target
    if (!(target instanceof Element)) {
      return
    }

    const radioItem = target.closest<HTMLElement>("[data-radio-item]")
    if (radioItem) {
      selectRadioItem(radioItem)
    }

    const hearOption = target.closest<HTMLElement>("[data-hear-option]")
    if (hearOption) {
      toggleHearOption(hearOption)
    }

    const toggle = target.closest<HTMLElement>("[data-toggle]")
    if (!toggle) {
      return
    }

    const nextActive = toggle.dataset.toggleActive !== "true"
    toggle.dataset.toggleActive = nextActive ? "true" : "false"
    toggle.setAttribute("aria-pressed", nextActive ? "true" : "false")

    if (toggle.dataset.toggle === "voice") {
      const group = toggle.closest<HTMLElement>(".ui-input-group")
      const input = group?.querySelector<HTMLInputElement>("input")
      if (input) {
        input.disabled = nextActive
        const placeholder = nextActive ? "Record and send audio..." : "Send a message..."
        const language = toggle.closest<HTMLElement>("[data-slot='rtl-components']")?.dataset.lang
        input.placeholder = language === "ar" || language === "he"
          ? translateRtlValue(placeholder, language)
          : placeholder
      }
    }
  })

  document.addEventListener("keydown", (event) => {
    const target = event.target
    if (!(target instanceof HTMLElement)) {
      return
    }

    if (target.matches(".root-hear-check[role='checkbox']") && (event.key === " " || event.key === "Enter")) {
      const hearOption = target.closest<HTMLElement>("[data-hear-option]")
      if (hearOption) {
        event.preventDefault()
        toggleHearOption(hearOption, true)
      }
      return
    }

    if (!target.matches(".ui-radio[role='radio']")) {
      return
    }
    const group = target.closest<HTMLElement>("[data-radio-group]")
    const currentItem = target.closest<HTMLElement>("[data-radio-item]")
    if (!group || !currentItem) {
      return
    }

    const items = Array.from(group.querySelectorAll<HTMLElement>("[data-radio-item]"))
    const currentIndex = items.indexOf(currentItem)
    const isRtl = getComputedStyle(group).direction === "rtl"
    let nextIndex: number | undefined

    if (event.key === "Home") {
      nextIndex = 0
    } else if (event.key === "End") {
      nextIndex = items.length - 1
    } else if (event.key === "ArrowDown" || event.key === (isRtl ? "ArrowLeft" : "ArrowRight")) {
      nextIndex = (currentIndex + 1) % items.length
    } else if (event.key === "ArrowUp" || event.key === (isRtl ? "ArrowRight" : "ArrowLeft")) {
      nextIndex = (currentIndex - 1 + items.length) % items.length
    } else if (event.key === " " || event.key === "Enter") {
      nextIndex = currentIndex
    }

    if (nextIndex === undefined) {
      return
    }
    event.preventDefault()
    selectRadioItem(items[nextIndex], true)
  })
}

function wireDashboardTables(): void {
  interface DashboardPointerRow {
    element: HTMLElement
    id: string
    centerY: number
    height: number
  }

  interface DashboardPointerDrag {
    pointerId: number
    dashboard: HTMLElement
    handle: HTMLElement
    sourceRow: HTMLElement
    sourceIndex: number
    sourceId: string
    rows: DashboardPointerRow[]
    startClientY: number
    overId: string
    started: boolean
  }

  let activeDrawerTrigger: HTMLButtonElement | null = null
  let activePointerDrag: DashboardPointerDrag | null = null
  let pointerDragId: string | null = null
  let keyboardDragId: string | null = null
  let keyboardOriginalOrder = ""

  const readRowOrder = (dashboard: HTMLElement): string[] => {
    return (dashboard.dataset.dashboardRowOrder || "")
      .split(",")
      .filter(Boolean)
  }

  const updateRowOrder = (dashboard: HTMLElement, order: string[]): void => {
    const value = order.join(",")
    dashboard.dataset.dashboardRowOrder = value
    const control = dashboard.querySelector<HTMLInputElement>("[data-dashboard-row-order-control]")
    if (!control) {
      return
    }

    control.value = value
    control.dispatchEvent(new Event("input", { bubbles: true }))
  }

  const announceRowMove = (dashboard: HTMLElement, rowId: string, message?: string): void => {
    const status = dashboard.querySelector<HTMLElement>("[data-dashboard-reorder-status]")
    if (!status) {
      return
    }

    if (message) {
      status.textContent = message
      return
    }

    const order = readRowOrder(dashboard)
    const row = dashboard.querySelector<HTMLElement>(`[data-dashboard-order-row="${rowId}"]`)
    const header = row?.querySelector<HTMLElement>("[data-dashboard-drawer-trigger]")?.textContent?.trim() ?? "Section"
    status.textContent = `${header} moved to position ${order.indexOf(rowId) + 1} of ${order.length}.`
  }

  const moveDashboardRow = (dashboard: HTMLElement, activeId: string, overId: string): boolean => {
    if (activeId === overId) {
      return false
    }

    const order = readRowOrder(dashboard)
    const oldIndex = order.indexOf(activeId)
    const newIndex = order.indexOf(overId)
    if (oldIndex < 0 || newIndex < 0) {
      return false
    }

    order.splice(oldIndex, 1)
    order.splice(newIndex, 0, activeId)
    updateRowOrder(dashboard, order)
    announceRowMove(dashboard, activeId)
    return true
  }

  const clearDragPresentation = (dashboard: HTMLElement): void => {
    dashboard.querySelectorAll<HTMLElement>("[data-dashboard-order-row]").forEach((row) => {
      row.removeAttribute("data-dragging")
      row.removeAttribute("data-drag-shifted")
      row.style.removeProperty("--dashboard-drag-offset-y")
    })
  }

  const updatePointerDragPresentation = (drag: DashboardPointerDrag, deltaY: number): void => {
    if (!drag.started) {
      if (Math.abs(deltaY) < 4) {
        return
      }
      drag.started = true
      drag.sourceRow.dataset.dragging = "true"
      drag.handle.setAttribute("aria-grabbed", "true")
    }

    drag.sourceRow.style.setProperty("--dashboard-drag-offset-y", `${deltaY}px`)
    const sourceRow = drag.rows[drag.sourceIndex]
    const draggedCenterY = sourceRow.centerY + deltaY
    let overIndex = drag.sourceIndex
    let closestDistance = Number.POSITIVE_INFINITY

    drag.rows.forEach((row, index) => {
      const distance = Math.abs(row.centerY - draggedCenterY)
      if (distance < closestDistance) {
        closestDistance = distance
        overIndex = index
      }
    })

    drag.overId = drag.rows[overIndex]?.id ?? drag.sourceId
    drag.rows.forEach((row, index) => {
      if (row.element === drag.sourceRow) {
        return
      }

      const shiftsUp = overIndex > drag.sourceIndex
        && index > drag.sourceIndex
        && index <= overIndex
      const shiftsDown = overIndex < drag.sourceIndex
        && index >= overIndex
        && index < drag.sourceIndex
      const offsetY = shiftsUp
        ? -sourceRow.height
        : shiftsDown
          ? sourceRow.height
          : 0

      if (offsetY === 0) {
        row.element.removeAttribute("data-drag-shifted")
        row.element.style.removeProperty("--dashboard-drag-offset-y")
      } else {
        row.element.dataset.dragShifted = "true"
        row.element.style.setProperty("--dashboard-drag-offset-y", `${offsetY}px`)
      }
    })
  }

  const finishPointerDrag = (commit: boolean): void => {
    const drag = activePointerDrag
    if (!drag) {
      return
    }

    activePointerDrag = null
    if (drag.handle.hasPointerCapture(drag.pointerId)) {
      drag.handle.releasePointerCapture(drag.pointerId)
    }
    drag.dashboard.removeAttribute("data-dashboard-pointer-dragging")
    drag.handle.setAttribute("aria-grabbed", "false")
    clearDragPresentation(drag.dashboard)

    if (commit && drag.started && drag.overId !== drag.sourceId) {
      moveDashboardRow(drag.dashboard, drag.sourceId, drag.overId)
    }
  }

  document.querySelectorAll<HTMLElement>("[data-dashboard-drag-handle]").forEach((handle) => {
    handle.setAttribute("draggable", "true")
  })

  const closeDrawer = (overlay: HTMLElement): void => {
    overlay.hidden = true
    document.body.removeAttribute("data-dashboard-drawer-open")
    if (activeDrawerTrigger) {
      activeDrawerTrigger.setAttribute("aria-expanded", "false")
      if (activeDrawerTrigger.isConnected) {
        activeDrawerTrigger.focus()
      }
    }
    activeDrawerTrigger = null
  }

  const openDrawer = (trigger: HTMLButtonElement): void => {
    const dashboard = trigger.closest<HTMLElement>(".dashboard-example")
    const overlay = dashboard?.querySelector<HTMLElement>("[data-dashboard-drawer]")
    if (!overlay) {
      return
    }

    const values: Record<string, string> = {
      header: trigger.dataset.dashboardDrawerHeader ?? "",
      type: trigger.dataset.dashboardDrawerType ?? "",
      status: trigger.dataset.dashboardDrawerStatus ?? "",
      target: trigger.dataset.dashboardDrawerTarget ?? "",
      limit: trigger.dataset.dashboardDrawerLimit ?? "",
      reviewer: trigger.dataset.dashboardDrawerReviewer === "Assign reviewer"
        ? ""
        : trigger.dataset.dashboardDrawerReviewer ?? "",
    }

    const title = overlay.querySelector<HTMLElement>("[data-dashboard-drawer-title]")
    if (title) {
      title.textContent = values.header
    }

    overlay.querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-dashboard-drawer-field]").forEach((field) => {
      const name = field.dataset.dashboardDrawerField
      if (name && values[name] !== undefined) {
        field.value = values[name]
      }
    })

    if (activeDrawerTrigger && activeDrawerTrigger !== trigger) {
      activeDrawerTrigger.setAttribute("aria-expanded", "false")
    }
    activeDrawerTrigger = trigger
    trigger.setAttribute("aria-expanded", "true")
    overlay.hidden = false
    document.body.dataset.dashboardDrawerOpen = "true"
    window.requestAnimationFrame(() => {
      overlay.querySelector<HTMLInputElement>("[data-dashboard-drawer-field='header']")?.focus()
    })
  }

  const updateSelection = (selectedRows: string, rowId: string, selected: boolean): string => {
    const token = `|${rowId}|`
    if (selected) {
      return selectedRows.includes(token) ? selectedRows : `${selectedRows}${rowId}|`
    }

    return selectedRows.replace(token, "|")
  }

  const countSelection = (selectedRows: string): number => {
    let separators = 0
    for (const character of selectedRows) {
      if (character === "|") {
        separators += 1
      }
    }

    return Math.max(0, separators - 1)
  }

  const syncSelection = (scope: HTMLElement): void => {
    const dashboard = scope.closest<HTMLElement>(".dashboard-example")
    const selectedRows = dashboard?.dataset.dashboardSelectedRows
      || scope.dataset.dashboardSelectedRows
      || "|"
    scope.dataset.dashboardSelectedRows = selectedRows
    if (dashboard) {
      dashboard.dataset.dashboardSelectedRows = selectedRows
    }
    const rowCheckboxes = scope.querySelectorAll<HTMLInputElement>("[data-dashboard-row-id]")
    let selectedPageRows = 0

    for (const checkbox of rowCheckboxes) {
      const rowId = checkbox.dataset.dashboardRowId
      const selected = Boolean(rowId && selectedRows.includes(`|${rowId}|`))
      checkbox.checked = selected
      const row = checkbox.closest("tr")
      if (selected) {
        row?.setAttribute("data-state", "selected")
        selectedPageRows += 1
      } else {
        row?.removeAttribute("data-state")
      }
    }

    const selectAll = scope.querySelector<HTMLInputElement>("[data-dashboard-select-all]")
    if (selectAll) {
      const allSelected = rowCheckboxes.length > 0 && selectedPageRows === rowCheckboxes.length
      selectAll.checked = allSelected
      selectAll.indeterminate = selectedPageRows > 0 && !allSelected
      selectAll.setAttribute("aria-checked", selectAll.indeterminate ? "mixed" : String(allSelected))
    }

    const block = scope.closest<HTMLElement>(".dashboard-table-block")
    const selectionLabel = block?.querySelector<HTMLElement>("[data-dashboard-total-rows]")
    if (selectionLabel) {
      const totalRows = selectionLabel.dataset.dashboardTotalRows || "0"
      selectionLabel.textContent = `${countSelection(selectedRows)} of ${totalRows} row(s) selected.`
    }
  }

  document.addEventListener("input", (event) => {
    const target = event.target
    if (!(target instanceof HTMLInputElement) || target.type !== "checkbox") {
      return
    }

    if (target.dataset.dashboardSelectAll === undefined && target.dataset.dashboardRowId === undefined) {
      return
    }

    const scope = target.closest<HTMLElement>(".dashboard-table-selection-scope")
    if (!scope) {
      return
    }

    const dashboard = scope.closest<HTMLElement>(".dashboard-example")
    let selectedRows = dashboard?.dataset.dashboardSelectedRows
      || scope.dataset.dashboardSelectedRows
      || "|"
    if (target.dataset.dashboardSelectAll !== undefined) {
      for (const checkbox of scope.querySelectorAll<HTMLInputElement>("[data-dashboard-row-id]")) {
        const rowId = checkbox.dataset.dashboardRowId
        if (rowId) {
          selectedRows = updateSelection(selectedRows, rowId, target.checked)
        }
      }
    } else {
      const rowId = target.dataset.dashboardRowId
      if (!rowId) {
        return
      }
      selectedRows = updateSelection(selectedRows, rowId, target.checked)
    }

    scope.dataset.dashboardSelectedRows = selectedRows
    if (dashboard) {
      dashboard.dataset.dashboardSelectedRows = selectedRows
    }
    syncSelection(scope)
  })

  document.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      return
    }

    const target = event.target
    const currentTab = target instanceof Element
      ? target.closest<HTMLButtonElement>(".dashboard-tabs-trigger")
      : null
    const tabList = currentTab?.closest<HTMLElement>(".dashboard-tabs-list")
    if (!currentTab || !tabList) {
      return
    }

    const tabs = Array.from(tabList.querySelectorAll<HTMLButtonElement>(".dashboard-tabs-trigger"))
    const currentIndex = tabs.indexOf(currentTab)
    if (currentIndex < 0 || tabs.length === 0) {
      return
    }

    const isRtl = getComputedStyle(tabList).direction === "rtl"
    let nextIndex = currentIndex
    if (event.key === "Home") {
      nextIndex = 0
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1
    } else if (event.key === (isRtl ? "ArrowLeft" : "ArrowRight")) {
      nextIndex = (currentIndex + 1) % tabs.length
    } else {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length
    }

    const nextTab = tabs[nextIndex]
    if (!nextTab) {
      return
    }

    event.preventDefault()
    nextTab.focus()
    nextTab.click()
  })

  document.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0 || activePointerDrag) {
      return
    }

    const target = event.target
    const handle = target instanceof Element
      ? target.closest<HTMLElement>("[data-dashboard-drag-handle]")
      : null
    const sourceRow = handle?.closest<HTMLElement>("[data-dashboard-order-row]")
    const dashboard = sourceRow?.closest<HTMLElement>(".dashboard-example")
    const sourceId = sourceRow?.dataset.dashboardOrderRow
    const body = sourceRow?.closest("tbody")
    if (!handle || !sourceRow || !dashboard || !sourceId || !body) {
      return
    }

    const rows: DashboardPointerRow[] = []
    body.querySelectorAll<HTMLElement>("[data-dashboard-order-row]").forEach((row) => {
      const id = row.dataset.dashboardOrderRow
      if (!id) {
        return
      }
      const rect = row.getBoundingClientRect()
      rows.push({
        element: row,
        id,
        centerY: rect.top + rect.height / 2,
        height: rect.height,
      })
    })
    const sourceIndex = rows.findIndex((row) => row.element === sourceRow)
    if (sourceIndex < 0) {
      return
    }

    activePointerDrag = {
      pointerId: event.pointerId,
      dashboard,
      handle,
      sourceRow,
      sourceIndex,
      sourceId,
      rows,
      startClientY: event.clientY,
      overId: sourceId,
      started: false,
    }
    dashboard.dataset.dashboardPointerDragging = "true"
    handle.setPointerCapture(event.pointerId)
    event.preventDefault()
  })

  document.addEventListener("pointermove", (event) => {
    const drag = activePointerDrag
    if (!drag || drag.pointerId !== event.pointerId) {
      return
    }

    event.preventDefault()
    updatePointerDragPresentation(drag, event.clientY - drag.startClientY)
  })

  document.addEventListener("pointerup", (event) => {
    if (!activePointerDrag || activePointerDrag.pointerId !== event.pointerId) {
      return
    }

    event.preventDefault()
    finishPointerDrag(true)
  })

  document.addEventListener("pointercancel", (event) => {
    if (activePointerDrag?.pointerId === event.pointerId) {
      finishPointerDrag(false)
    }
  })

  window.addEventListener("blur", () => {
    finishPointerDrag(false)
  })

  document.addEventListener("dragstart", (event) => {
    if (activePointerDrag) {
      event.preventDefault()
      return
    }

    const target = event.target
    if (!(target instanceof Element)) {
      return
    }

    const handle = target.closest<HTMLElement>("[data-dashboard-drag-handle]")
    const row = handle?.closest<HTMLElement>("[data-dashboard-order-row]")
    const rowId = row?.dataset.dashboardOrderRow
    if (!handle || !row || !rowId) {
      return
    }

    pointerDragId = rowId
    row.dataset.dragging = "true"
    handle.setAttribute("aria-grabbed", "true")
    event.dataTransfer?.setData("text/plain", rowId)
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move"
    }
  })

  document.addEventListener("dragover", (event) => {
    if (!pointerDragId) {
      return
    }

    const target = event.target
    if (!(target instanceof Element)) {
      return
    }

    const row = target.closest<HTMLElement>("[data-dashboard-order-row]")
    const dashboard = row?.closest<HTMLElement>(".dashboard-example")
    if (!row || !dashboard || row.dataset.dashboardOrderRow === pointerDragId) {
      return
    }

    event.preventDefault()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move"
    }
  })

  document.addEventListener("drop", (event) => {
    if (!pointerDragId) {
      return
    }

    const target = event.target
    const row = target instanceof Element
      ? target.closest<HTMLElement>("[data-dashboard-order-row]")
      : null
    const dashboard = row?.closest<HTMLElement>(".dashboard-example")
    const overId = row?.dataset.dashboardOrderRow
    if (dashboard && overId) {
      event.preventDefault()
      moveDashboardRow(dashboard, pointerDragId, overId)
      clearDragPresentation(dashboard)
      dashboard
        .querySelector<HTMLElement>(`[data-dashboard-order-row="${pointerDragId}"] [data-dashboard-drag-handle]`)
        ?.setAttribute("aria-grabbed", "false")
    }
    pointerDragId = null
  })

  document.addEventListener("dragend", (event) => {
    const target = event.target
    const dashboard = target instanceof Element
      ? target.closest<HTMLElement>(".dashboard-example")
      : null
    if (dashboard) {
      clearDragPresentation(dashboard)
      dashboard.querySelectorAll<HTMLElement>("[data-dashboard-drag-handle]").forEach((handle) => {
        handle.setAttribute("aria-grabbed", "false")
      })
    }
    pointerDragId = null
  })

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && activePointerDrag) {
      event.preventDefault()
      finishPointerDrag(false)
      return
    }

    const target = event.target
    if (!(target instanceof Element)) {
      return
    }

    const handle = target.closest<HTMLElement>("[data-dashboard-drag-handle]")
    const row = handle?.closest<HTMLElement>("[data-dashboard-order-row]")
    const dashboard = row?.closest<HTMLElement>(".dashboard-example")
    const rowId = row?.dataset.dashboardOrderRow
    if (!handle || !row || !dashboard || !rowId) {
      return
    }

    if (event.key === " " || event.key === "Enter") {
      event.preventDefault()
      if (keyboardDragId === rowId) {
        keyboardDragId = null
        keyboardOriginalOrder = ""
        handle.setAttribute("aria-grabbed", "false")
        clearDragPresentation(dashboard)
        announceRowMove(dashboard, rowId, "Section dropped.")
      } else {
        keyboardDragId = rowId
        keyboardOriginalOrder = readRowOrder(dashboard).join(",")
        handle.setAttribute("aria-grabbed", "true")
        row.dataset.dragging = "true"
        announceRowMove(dashboard, rowId, "Section picked up. Use the arrow keys to move it.")
      }
      return
    }

    if (keyboardDragId !== rowId) {
      return
    }

    if (event.key === "Escape") {
      event.preventDefault()
      updateRowOrder(dashboard, keyboardOriginalOrder.split(",").filter(Boolean))
      keyboardDragId = null
      keyboardOriginalOrder = ""
      handle.setAttribute("aria-grabbed", "false")
      clearDragPresentation(dashboard)
      announceRowMove(dashboard, rowId, "Reordering canceled.")
      return
    }

    const delta = event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0
    if (delta === 0) {
      return
    }

    event.preventDefault()
    const visibleRows = Array.from(
      row.closest("tbody")?.querySelectorAll<HTMLElement>("[data-dashboard-order-row]") ?? [],
    )
    const visibleIndex = visibleRows.findIndex((candidate) => candidate.dataset.dashboardOrderRow === rowId)
    const overRow = visibleRows[visibleIndex + delta]
    const overId = overRow?.dataset.dashboardOrderRow
    if (overId && moveDashboardRow(dashboard, rowId, overId)) {
      window.requestAnimationFrame(() => {
        dashboard
          .querySelector<HTMLElement>(`[data-dashboard-order-row="${rowId}"] [data-dashboard-drag-handle]`)
          ?.focus()
      })
    }
  })

  document.addEventListener("click", (event) => {
    const target = event.target
    if (!(target instanceof Element)) {
      return
    }

    const trigger = target.closest<HTMLButtonElement>("[data-dashboard-drawer-trigger]")
    if (trigger) {
      event.preventDefault()
      openDrawer(trigger)
      return
    }

    const overlay = target.closest<HTMLElement>("[data-dashboard-drawer]")
    if (!overlay) {
      return
    }

    if (target.closest("[data-dashboard-drawer-close]") || target === overlay) {
      event.preventDefault()
      closeDrawer(overlay)
    }
  })

  document.addEventListener("keydown", (event) => {
    const overlay = document.querySelector<HTMLElement>("[data-dashboard-drawer]:not([hidden])")
    if (!overlay) {
      return
    }

    if (event.key === "Escape") {
      event.preventDefault()
      closeDrawer(overlay)
      return
    }

    if (event.key !== "Tab") {
      return
    }

    const focusable = Array.from(
      overlay.querySelectorAll<HTMLElement>("button:not(:disabled), input:not(:disabled), select:not(:disabled)"),
    )
    if (focusable.length === 0) {
      return
    }

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  })
}

function wireTasksTables(): void {
  type FacetKind = "status" | "priority"

  const hasToken = (values: string, value: string): boolean => values.includes(`|${value}|`)
  const toggleToken = (values: string, value: string): string => {
    const token = `|${value}|`
    return values.includes(token) ? values.replace(token, "|") : `${values}${value}|`
  }

  document.querySelectorAll<HTMLElement>(".tasks-example").forEach((root) => {
    const body = root.querySelector<HTMLTableSectionElement>(".tasks-data-table tbody")
    const bank = root.querySelector<HTMLElement>("[data-tasks-row-bank]")
    if (!body || !bank) {
      return
    }

    const initialRows = Array.from(body.querySelectorAll<HTMLTableRowElement>("[data-task-row]"))
    const statusIcons = new Map<string, Element>()
    const priorityIcons = new Map<string, Element>()
    for (const row of initialRows) {
      const status = row.dataset.taskStatus
      const priority = row.dataset.taskPriority
      const statusIcon = row.querySelector(".tasks-status-cell .tasks-meta-icon")
      const priorityIcon = row.querySelector("[data-task-column='priority'] .tasks-meta-icon")
      if (status && statusIcon && !statusIcons.has(status)) {
        statusIcons.set(status, statusIcon)
      }
      if (priority && priorityIcon && !priorityIcons.has(priority)) {
        priorityIcons.set(priority, priorityIcon)
      }
    }
    const actionMenuTemplate = initialRows[0]?.querySelector<HTMLElement>("[data-task-row-menu]") ?? null

    const formatLabel = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1)
    const createMetaIcon = (templates: Map<string, Element>, value: string): Node => {
      const template = templates.get(value)
      if (template) {
        return template.cloneNode(true)
      }
      const fallback = document.createElement("span")
      fallback.className = "tasks-meta-icon"
      return fallback
    }

    const createRow = (record: HTMLElement): HTMLTableRowElement => {
      const taskId = record.dataset.taskId ?? ""
      const title = record.dataset.taskTitleText ?? ""
      const status = record.dataset.taskStatus ?? ""
      const priority = record.dataset.taskPriority ?? ""
      const label = record.dataset.taskLabel ?? ""
      const row = document.createElement("tr")
      row.dataset.taskRow = "true"
      row.dataset.taskIndex = record.dataset.taskIndex ?? "0"
      row.dataset.taskId = taskId
      row.dataset.taskTitle = record.dataset.taskTitle ?? title.toLowerCase()
      row.dataset.taskTitleText = title
      row.dataset.taskStatus = status
      row.dataset.taskPriority = priority
      row.dataset.taskLabel = label

      const selectCell = document.createElement("td")
      selectCell.className = "tasks-cell-select"
      const checkbox = document.createElement("input")
      checkbox.type = "checkbox"
      checkbox.className = "tasks-checkbox"
      checkbox.dataset.taskRowSelect = "true"
      checkbox.setAttribute("aria-label", `Select ${taskId}`)
      selectCell.append(checkbox)

      const idCell = document.createElement("td")
      idCell.className = "tasks-cell-id"
      idCell.textContent = taskId

      const titleCell = document.createElement("td")
      titleCell.dataset.taskColumn = "title"
      const titleLayout = document.createElement("div")
      titleLayout.className = "tasks-title-cell"
      const badge = document.createElement("span")
      badge.className = "tasks-label-badge"
      badge.textContent = formatLabel(label)
      const titleText = document.createElement("span")
      titleText.className = "tasks-title-text"
      titleText.textContent = title
      titleLayout.append(badge, titleText)
      titleCell.append(titleLayout)

      const statusCell = document.createElement("td")
      statusCell.dataset.taskColumn = "status"
      const statusLayout = document.createElement("div")
      statusLayout.className = "tasks-meta-cell tasks-status-cell"
      const statusText = document.createElement("span")
      statusText.textContent = status === "in progress" ? "In Progress" : formatLabel(status)
      statusLayout.append(createMetaIcon(statusIcons, status), statusText)
      statusCell.append(statusLayout)

      const priorityCell = document.createElement("td")
      priorityCell.dataset.taskColumn = "priority"
      const priorityLayout = document.createElement("div")
      priorityLayout.className = "tasks-meta-cell"
      const priorityText = document.createElement("span")
      priorityText.textContent = formatLabel(priority)
      priorityLayout.append(createMetaIcon(priorityIcons, priority), priorityText)
      priorityCell.append(priorityLayout)

      const actionCell = document.createElement("td")
      actionCell.className = "tasks-cell-actions"
      if (actionMenuTemplate) {
        const actionMenu = actionMenuTemplate.cloneNode(true) as HTMLElement
        const action = actionMenu.querySelector<HTMLElement>(".tasks-row-action")
        const panel = actionMenu.querySelector<HTMLElement>(":scope > [data-menu-panel]")
        const labelPanel = actionMenu.querySelector<HTMLElement>("[data-task-label-panel]")
        if (action) {
          action.setAttribute("aria-label", `Open menu for ${taskId}`)
          action.setAttribute("aria-expanded", "false")
        }
        if (panel) {
          panel.setAttribute("aria-label", `${taskId} actions`)
          panel.hidden = true
        }
        if (labelPanel) {
          labelPanel.setAttribute("aria-label", `Labels for ${taskId}`)
          labelPanel.hidden = true
        }
        actionCell.append(actionMenu)
      } else {
        const action = document.createElement("button")
        action.type = "button"
        action.className = "tasks-row-action"
        action.setAttribute("aria-label", `Open menu for ${taskId}`)
        actionCell.append(action)
      }

      row.append(selectCell, idCell, titleCell, statusCell, priorityCell, actionCell)
      return row
    }

    const allRows = [
      ...initialRows,
      ...Array.from(bank.querySelectorAll<HTMLElement>("[data-task-record]"), createRow),
    ].sort((left, right) => {
      return Number(left.dataset.taskIndex ?? 0) - Number(right.dataset.taskIndex ?? 0)
    })

    const getFacetValues = (kind: FacetKind): string => {
      return kind === "status"
        ? root.dataset.tasksStatusValues || "|"
        : root.dataset.tasksPriorityValues || "|"
    }

    const setFacetValues = (kind: FacetKind, values: string): void => {
      if (kind === "status") {
        root.dataset.tasksStatusValues = values
      } else {
        root.dataset.tasksPriorityValues = values
      }
    }

    const matchesQuery = (row: HTMLTableRowElement, query: string): boolean => {
      return query === "" || (row.dataset.taskTitle ?? "").includes(query)
    }

    const matchesFacet = (row: HTMLTableRowElement, kind: FacetKind, values: string): boolean => {
      if (values === "|") {
        return true
      }
      const value = kind === "status" ? row.dataset.taskStatus : row.dataset.taskPriority
      return Boolean(value && hasToken(values, value))
    }

    const getFilteredRows = (): HTMLTableRowElement[] => {
      const query = (root.dataset.tasksQuery ?? "").trim().toLowerCase()
      const statusValues = getFacetValues("status")
      const priorityValues = getFacetValues("priority")
      const rows = allRows.filter((row) => {
        return matchesQuery(row, query)
          && matchesFacet(row, "status", statusValues)
          && matchesFacet(row, "priority", priorityValues)
      })
      const sortColumn = root.dataset.tasksSortColumn
      const sortDirection = root.dataset.tasksSortDirection
      if ((sortColumn !== "title" && sortColumn !== "status" && sortColumn !== "priority")
        || (sortDirection !== "asc" && sortDirection !== "desc")) {
        return rows
      }

      const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" })
      rows.sort((left, right) => {
        const leftValue = sortColumn === "title"
          ? left.dataset.taskTitleText ?? ""
          : sortColumn === "status"
            ? left.dataset.taskStatus ?? ""
            : left.dataset.taskPriority ?? ""
        const rightValue = sortColumn === "title"
          ? right.dataset.taskTitleText ?? ""
          : sortColumn === "status"
            ? right.dataset.taskStatus ?? ""
            : right.dataset.taskPriority ?? ""
        const compared = collator.compare(leftValue, rightValue)
        if (compared === 0) {
          return Number(left.dataset.taskIndex ?? 0) - Number(right.dataset.taskIndex ?? 0)
        }
        return sortDirection === "desc" ? -compared : compared
      })
      return rows
    }

    const syncRowActions = (): void => {
      for (const row of allRows) {
        const label = row.dataset.taskLabel ?? ""
        const badge = row.querySelector<HTMLElement>(".tasks-label-badge")
        if (badge) {
          badge.textContent = formatLabel(label)
        }
        row.querySelectorAll<HTMLElement>("[data-task-label-value]").forEach((option) => {
          const selected = option.dataset.taskLabelValue === label
          option.dataset.selected = selected ? "true" : "false"
          option.setAttribute("aria-checked", selected ? "true" : "false")
        })
      }
    }

    const syncColumns = (): void => {
      const hiddenColumns = root.dataset.tasksHiddenColumns || "|"
      root.querySelectorAll<HTMLElement>("thead [data-task-column]").forEach((header) => {
        const column = header.dataset.taskColumn
        header.hidden = Boolean(column && hasToken(hiddenColumns, column))
      })
      for (const row of allRows) {
        row.querySelectorAll<HTMLElement>("[data-task-column]").forEach((cell) => {
          const column = cell.dataset.taskColumn
          cell.hidden = Boolean(column && hasToken(hiddenColumns, column))
        })
      }

      const sortColumn = root.dataset.tasksSortColumn ?? ""
      const sortDirection = root.dataset.tasksSortDirection ?? ""
      root.querySelectorAll<HTMLElement>("[data-task-sort-trigger]").forEach((trigger) => {
        const activeDirection = trigger.dataset.taskSortTrigger === sortColumn
          && (sortDirection === "asc" || sortDirection === "desc")
          ? sortDirection
          : "none"
        trigger.dataset.sortDirection = activeDirection
        const header = trigger.closest<HTMLElement>("th")
        if (header) {
          if (activeDirection === "none") {
            header.removeAttribute("aria-sort")
          } else {
            header.setAttribute("aria-sort", activeDirection === "asc" ? "ascending" : "descending")
          }
        }
      })

      root.querySelectorAll<HTMLElement>("[data-task-column-toggle]").forEach((option) => {
        const column = option.dataset.taskColumnToggle
        const visible = Boolean(column && !hasToken(hiddenColumns, column))
        option.dataset.selected = visible ? "true" : "false"
        option.setAttribute("aria-checked", visible ? "true" : "false")
      })
    }

    const syncFacet = (kind: FacetKind, query: string): void => {
      const menu = root.querySelector<HTMLElement>(`[data-task-facet="${kind}"]`)
      if (!menu) {
        return
      }

      const selectedValues = getFacetValues(kind)
      const otherKind: FacetKind = kind === "status" ? "priority" : "status"
      const otherValues = getFacetValues(otherKind)
      const selectedLabels: string[] = []

      menu.querySelectorAll<HTMLElement>("[data-task-facet-option]").forEach((option) => {
        const value = option.dataset.taskFacetOption ?? ""
        const selected = hasToken(selectedValues, value)
        option.dataset.selected = String(selected)
        option.setAttribute("aria-selected", String(selected))
        if (selected) {
          const label = option.querySelector<HTMLElement>("span:nth-last-child(2)")?.textContent?.trim()
          if (label) {
            selectedLabels.push(label)
          }
        }

        const count = allRows.filter((row) => {
          const rowValue = kind === "status" ? row.dataset.taskStatus : row.dataset.taskPriority
          return rowValue === value
            && matchesQuery(row, query)
            && matchesFacet(row, otherKind, otherValues)
        }).length
        const countTarget = option.querySelector<HTMLElement>("[data-task-facet-count]")
        if (countTarget) {
          countTarget.textContent = String(count)
        }
      })

      const summary = menu.querySelector<HTMLElement>("[data-task-facet-summary]")
      const compact = menu.querySelector<HTMLElement>("[data-task-facet-summary-compact]")
      const wide = menu.querySelector<HTMLElement>("[data-task-facet-summary-wide]")
      if (summary && compact && wide) {
        summary.hidden = selectedLabels.length === 0
        compact.textContent = String(selectedLabels.length)
        wide.replaceChildren()
        const labels = selectedLabels.length > 2
          ? [`${selectedLabels.length} selected`]
          : selectedLabels
        for (const label of labels) {
          const badge = document.createElement("span")
          badge.className = "tasks-facet-summary-badge"
          badge.textContent = label
          wide.append(badge)
        }
      }

      const clearWrap = menu.querySelector<HTMLElement>("[data-task-facet-clear-wrap]")
      if (clearWrap) {
        clearWrap.hidden = selectedLabels.length === 0
      }
    }

    const sync = (): void => {
      const query = (root.dataset.tasksQuery ?? "").trim().toLowerCase()
      const statusValues = getFacetValues("status")
      const priorityValues = getFacetValues("priority")
      const filteredRows = getFilteredRows()
      const pageSize = Number.parseInt(root.dataset.tasksPageSize ?? "25", 10) || 25
      const pageCount = Math.ceil(filteredRows.length / pageSize)
      const maximumPageIndex = Math.max(0, pageCount - 1)
      const requestedPageIndex = Number.parseInt(root.dataset.tasksPageIndex ?? "0", 10) || 0
      const pageIndex = Math.min(maximumPageIndex, Math.max(0, requestedPageIndex))
      root.dataset.tasksPageIndex = String(pageIndex)

      body.querySelectorAll("[data-task-row], [data-tasks-empty-row]").forEach((row) => row.remove())
      const pageRows = filteredRows.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
      for (const row of pageRows) {
        body.append(row)
      }

      if (pageRows.length === 0) {
        const emptyRow = document.createElement("tr")
        emptyRow.className = "tasks-empty-row"
        emptyRow.dataset.tasksEmptyRow = "true"
        const cell = document.createElement("td")
        const hiddenColumnCount = ["title", "status", "priority"].filter((column) => {
          return hasToken(root.dataset.tasksHiddenColumns || "|", column)
        }).length
        cell.colSpan = 6 - hiddenColumnCount
        cell.textContent = "No results."
        emptyRow.append(cell)
        body.append(emptyRow)
      }

      const selectedValues = root.dataset.tasksSelectedValues || "|"
      let selectedPageRows = 0
      for (const row of pageRows) {
        const taskId = row.dataset.taskId
        const selected = Boolean(taskId && hasToken(selectedValues, taskId))
        const checkbox = row.querySelector<HTMLInputElement>("[data-task-row-select]")
        if (checkbox) {
          checkbox.checked = selected
        }
        if (selected) {
          row.setAttribute("data-state", "selected")
          selectedPageRows += 1
        } else {
          row.removeAttribute("data-state")
        }
      }

      const selectAll = root.querySelector<HTMLInputElement>("[data-tasks-select-all]")
      if (selectAll) {
        const allSelected = pageRows.length > 0 && selectedPageRows === pageRows.length
        selectAll.checked = allSelected
        selectAll.indeterminate = selectedPageRows > 0 && !allSelected
        selectAll.setAttribute("aria-checked", selectAll.indeterminate ? "mixed" : String(allSelected))
      }

      const selectedCount = filteredRows.filter((row) => {
        const taskId = row.dataset.taskId
        return Boolean(taskId && hasToken(selectedValues, taskId))
      }).length
      const selection = root.querySelector<HTMLElement>("[data-tasks-selection]")
      if (selection) {
        selection.textContent = `${selectedCount} of ${filteredRows.length} row(s) selected.`
      }

      const pageLabel = root.querySelector<HTMLElement>("[data-tasks-page-label]")
      if (pageLabel) {
        pageLabel.textContent = `Page ${pageIndex + 1} of ${pageCount}`
      }

      const pageSizeSelect = root.querySelector<HTMLSelectElement>("[data-tasks-page-size-select]")
      if (pageSizeSelect) {
        pageSizeSelect.value = String(pageSize)
      }

      root.querySelectorAll<HTMLButtonElement>("[data-tasks-page-action]").forEach((button) => {
        const action = button.dataset.tasksPageAction
        button.disabled = action === "first" || action === "previous"
          ? pageIndex === 0
          : pageIndex >= maximumPageIndex
      })

      syncFacet("status", query)
      syncFacet("priority", query)

      const reset = root.querySelector<HTMLButtonElement>("[data-tasks-reset]")
      if (reset) {
        reset.hidden = query === "" && statusValues === "|" && priorityValues === "|"
      }

      syncColumns()
      syncRowActions()
    }

    const openTaskLabelPanel = (trigger: HTMLElement, panel: HTMLElement): void => {
      const shouldOpen = panel.hidden
      panel.hidden = !shouldOpen
      trigger.setAttribute("aria-expanded", shouldOpen ? "true" : "false")
      trigger.dataset.state = shouldOpen ? "open" : "closed"
      if (shouldOpen) {
        positionShowcaseMenu(panel)
      }
    }

    root.addEventListener("pointerover", (event) => {
      const target = event.target
      if (!(target instanceof Element)) {
        return
      }
      const trigger = target.closest<HTMLElement>("[data-task-label-trigger]")
      const panel = trigger?.parentElement?.querySelector<HTMLElement>(":scope > [data-task-label-panel]")
      if (trigger && panel && panel.hidden) {
        openTaskLabelPanel(trigger, panel)
      }
    })

    root.addEventListener("input", (event) => {
      const target = event.target
      if (target instanceof HTMLSelectElement && target.dataset.tasksPageSizeSelect !== undefined) {
        const pageSize = Number.parseInt(target.value, 10)
        if ([10, 20, 25, 30, 40, 50].includes(pageSize)) {
          root.dataset.tasksPageSize = String(pageSize)
          root.dataset.tasksPageIndex = "0"
          sync()
        }
        return
      }

      if (!(target instanceof HTMLInputElement)) {
        return
      }

      if (target.dataset.tasksSelectAll !== undefined) {
        let selectedValues = root.dataset.tasksSelectedValues || "|"
        body.querySelectorAll<HTMLTableRowElement>("[data-task-row]").forEach((row) => {
          const taskId = row.dataset.taskId
          if (taskId && hasToken(selectedValues, taskId) !== target.checked) {
            selectedValues = toggleToken(selectedValues, taskId)
          }
        })
        root.dataset.tasksSelectedValues = selectedValues
        sync()
        return
      }

      if (target.dataset.taskRowSelect !== undefined) {
        const taskId = target.closest<HTMLTableRowElement>("[data-task-row]")?.dataset.taskId
        if (taskId) {
          const selectedValues = root.dataset.tasksSelectedValues || "|"
          if (hasToken(selectedValues, taskId) !== target.checked) {
            root.dataset.tasksSelectedValues = toggleToken(selectedValues, taskId)
          }
          sync()
        }
        return
      }

      if (target.dataset.tasksFilter !== undefined) {
        root.dataset.tasksQuery = target.value
        root.dataset.tasksPageIndex = "0"
        sync()
        return
      }

      if (target.dataset.taskFacetSearch !== undefined) {
        const panel = target.closest<HTMLElement>("[data-menu-panel]")
        if (!panel) {
          return
        }
        const query = target.value.trim().toLowerCase()
        let visible = 0
        panel.querySelectorAll<HTMLElement>("[data-task-facet-option]").forEach((option) => {
          const label = option.textContent?.toLowerCase() ?? ""
          const matches = query === "" || label.includes(query)
          option.hidden = !matches
          if (matches) {
            visible += 1
          }
        })
        const empty = panel.querySelector<HTMLElement>("[data-task-facet-empty]")
        if (empty) {
          empty.hidden = visible > 0
        }
      }
    })

    root.addEventListener("click", (event) => {
      const target = event.target
      if (!(target instanceof Element)) {
        return
      }

      const rowMenuTrigger = target.closest<HTMLElement>("[data-task-row-menu] > [data-menu-trigger]")
      if (rowMenuTrigger) {
        const menu = rowMenuTrigger.closest<HTMLElement>("[data-task-row-menu]")
        const labelTrigger = menu?.querySelector<HTMLElement>("[data-task-label-trigger]")
        const labelPanel = menu?.querySelector<HTMLElement>("[data-task-label-panel]")
        if (labelTrigger) {
          labelTrigger.setAttribute("aria-expanded", "false")
          labelTrigger.dataset.state = "closed"
        }
        if (labelPanel) {
          labelPanel.hidden = true
        }
        return
      }

      const labelTrigger = target.closest<HTMLElement>("[data-task-label-trigger]")
      if (labelTrigger) {
        const panel = labelTrigger.parentElement?.querySelector<HTMLElement>(":scope > [data-task-label-panel]")
        if (panel?.hidden) {
          openTaskLabelPanel(labelTrigger, panel)
        }
        return
      }

      const labelOption = target.closest<HTMLElement>("[data-task-label-value]")
      if (labelOption) {
        const row = labelOption.closest<HTMLTableRowElement>("[data-task-row]")
        const label = labelOption.dataset.taskLabelValue
        if (row && (label === "bug" || label === "feature" || label === "documentation")) {
          row.dataset.taskLabel = label
          syncRowActions()
        }
        return
      }

      const pageButton = target.closest<HTMLButtonElement>("[data-tasks-page-action]")
      if (pageButton && !pageButton.disabled) {
        const pageSize = Number.parseInt(root.dataset.tasksPageSize ?? "25", 10) || 25
        const pageCount = Math.ceil(getFilteredRows().length / pageSize)
        const lastPageIndex = Math.max(0, pageCount - 1)
        const currentPageIndex = Number.parseInt(root.dataset.tasksPageIndex ?? "0", 10) || 0
        const action = pageButton.dataset.tasksPageAction
        const nextPageIndex = action === "first"
          ? 0
          : action === "previous"
            ? currentPageIndex - 1
            : action === "next"
              ? currentPageIndex + 1
              : lastPageIndex
        root.dataset.tasksPageIndex = String(Math.min(lastPageIndex, Math.max(0, nextPageIndex)))
        sync()
        return
      }

      const sortAction = target.closest<HTMLElement>("[data-task-sort-action]")
      if (sortAction) {
        const menu = sortAction.closest<HTMLElement>("[data-task-sort-menu]")
        const column = menu?.dataset.taskSortMenu
        const action = sortAction.dataset.taskSortAction
        if (column === "title" || column === "status" || column === "priority") {
          if (action === "asc" || action === "desc") {
            root.dataset.tasksSortColumn = column
            root.dataset.tasksSortDirection = action
          } else if (action === "hide") {
            const hiddenColumns = root.dataset.tasksHiddenColumns || "|"
            if (!hasToken(hiddenColumns, column)) {
              root.dataset.tasksHiddenColumns = toggleToken(hiddenColumns, column)
            }
          }
          root.dataset.tasksPageIndex = "0"
          sync()
        }
        return
      }

      const columnToggle = target.closest<HTMLElement>("[data-task-column-toggle]")
      if (columnToggle) {
        const column = columnToggle.dataset.taskColumnToggle
        if (column === "title" || column === "status" || column === "priority") {
          root.dataset.tasksHiddenColumns = toggleToken(root.dataset.tasksHiddenColumns || "|", column)
          sync()
        }
        return
      }

      const option = target.closest<HTMLElement>("[data-task-facet-option]")
      if (option) {
        const menu = option.closest<HTMLElement>("[data-task-facet]")
        const kind = menu?.dataset.taskFacet
        const value = option.dataset.taskFacetOption
        if ((kind === "status" || kind === "priority") && value) {
          setFacetValues(kind, toggleToken(getFacetValues(kind), value))
          root.dataset.tasksPageIndex = "0"
          sync()
        }
        return
      }

      const clear = target.closest<HTMLElement>("[data-task-facet-clear]")
      if (clear) {
        const menu = clear.closest<HTMLElement>("[data-task-facet]")
        const kind = menu?.dataset.taskFacet
        if (kind === "status" || kind === "priority") {
          setFacetValues(kind, "|")
          root.dataset.tasksPageIndex = "0"
          sync()
        }
        return
      }

      if (target.closest("[data-tasks-reset]")) {
        root.dataset.tasksQuery = ""
        root.dataset.tasksStatusValues = "|"
        root.dataset.tasksPriorityValues = "|"
        root.dataset.tasksPageIndex = "0"
        const filter = root.querySelector<HTMLInputElement>("[data-tasks-filter]")
        if (filter) {
          filter.value = ""
        }
        sync()
      }
    })

    sync()
  })
}

function wireShowcaseMentions(): void {
  const commandItems = (root: HTMLElement): HTMLElement[] =>
    Array.from(root.querySelectorAll<HTMLElement>("[data-mention-item]"))

  const visibleCommandItems = (root: HTMLElement): HTMLElement[] =>
    commandItems(root).filter((item) => !item.hidden)

  const selectCommandItem = (root: HTMLElement, selectedItem?: HTMLElement): void => {
    commandItems(root).forEach((item) => {
      const selected = item === selectedItem
      item.dataset.selected = selected ? "true" : "false"
      item.setAttribute("aria-selected", selected ? "true" : "false")
    })
  }

  const syncMentionRoot = (root: HTMLElement): void => {
    const chips = root.querySelector<HTMLElement>("[data-mention-chips]")
    const trigger = root.querySelector<HTMLElement>("[data-menu-trigger]")
    const hasMentions = (chips?.childElementCount ?? 0) > 0
    if (trigger) {
      trigger.dataset.compact = hasMentions ? "true" : "false"
    }
  }

  const filterCommandList = (root: HTMLElement): void => {
    const search = root.querySelector<HTMLInputElement>("[data-mention-search]")
    const query = (search?.value ?? "").trim().toLowerCase()
    const list = root.querySelector<HTMLElement>("[data-mention-list]")
    if (!list) {
      return
    }

    let visible = 0
    list.querySelectorAll<HTMLElement>("[data-mention-item]").forEach((item) => {
      const title = (item.dataset.mentionTitle ?? "").toLowerCase()
      const taken = item.dataset.mentionTaken === "true"
      const matches = !taken && (query === "" || title.includes(query))
      item.hidden = !matches
      if (matches) {
        visible += 1
      }
    })

    list.querySelectorAll<HTMLElement>("[data-mention-group]").forEach((group) => {
      const anyVisible = Array.from(group.querySelectorAll<HTMLElement>("[data-mention-item]")).some(
        (item) => !item.hidden,
      )
      group.hidden = !anyVisible
    })

    const empty = list.querySelector<HTMLElement>("[data-mention-empty]")
    if (empty) {
      empty.hidden = visible > 0
    }

    selectCommandItem(root, visibleCommandItems(root)[0])
  }

  document.addEventListener("showcase-menu-open", (event) => {
    const panel = event.target
    if (!(panel instanceof HTMLElement)) {
      return
    }

    Array.from(panel.querySelectorAll<HTMLElement>("[data-command-scope]"))
      .filter((scope) => scope.closest("[data-menu-panel]") === panel)
      .forEach(filterCommandList)
  })

  document.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") {
      return
    }

    const target = event.target
    if (!(target instanceof Element)) {
      return
    }

    const item = target.closest<HTMLElement>("[data-mention-item]")
    const root = item?.closest<HTMLElement>("[data-command-scope]")
    if (item && root && !item.hidden) {
      selectCommandItem(root, item)
    }
  })

  document.addEventListener("keydown", (event) => {
    const target = event.target
    if (!(target instanceof HTMLInputElement) || target.dataset.mentionSearch === undefined) {
      return
    }

    const root = target.closest<HTMLElement>("[data-command-scope]")
    if (!root) {
      return
    }

    const items = visibleCommandItems(root)
    if (items.length === 0) {
      return
    }

    const selectedIndex = items.findIndex((item) => item.dataset.selected === "true")
    let nextIndex: number | undefined
    if (event.key === "ArrowDown") {
      nextIndex = selectedIndex < 0 ? 0 : (selectedIndex + 1) % items.length
    } else if (event.key === "ArrowUp") {
      nextIndex = selectedIndex < 0 ? items.length - 1 : (selectedIndex - 1 + items.length) % items.length
    } else if (event.key === "Home") {
      nextIndex = 0
    } else if (event.key === "End") {
      nextIndex = items.length - 1
    } else if (event.key === "Enter" && selectedIndex >= 0) {
      event.preventDefault()
      items[selectedIndex].click()
      return
    }

    if (nextIndex === undefined) {
      return
    }

    event.preventDefault()
    const nextItem = items[nextIndex]
    selectCommandItem(root, nextItem)
    nextItem.scrollIntoView({ block: "nearest" })
  })

  document.addEventListener("click", (event) => {
    const target = event.target
    if (!(target instanceof Element)) {
      return
    }

    const chip = target.closest<HTMLElement>("[data-mention-chip]")
    if (chip) {
      const root = chip.closest<HTMLElement>("[data-mention-root]")
      const title = chip.dataset.mentionChip
      chip.remove()
      if (root) {
        root
          .querySelectorAll<HTMLElement>("[data-mention-item]")
          .forEach((item) => {
            if (item.dataset.mentionTitle === title) {
              item.dataset.mentionTaken = "false"
            }
          })
        filterCommandList(root)
        syncMentionRoot(root)
      }
      return
    }

    const item = target.closest<HTMLElement>("[data-mention-item]")
    if (!item) {
      return
    }

    const root = item.closest<HTMLElement>("[data-mention-root]")
    const chips = root?.querySelector<HTMLElement>("[data-mention-chips]")
    const title = item.dataset.mentionTitle

    if (!root || !chips || !title) {
      event.preventDefault()
      closeShowcaseMenus()
      return
    }

    event.preventDefault()

    const button = document.createElement("button")
    button.type = "button"
    button.className = "root-mention-chip"
    button.dataset.mentionChip = title
    button.setAttribute("aria-label", `Remove ${title}`)

    const media = document.createElement("span")
    if (item.dataset.mentionAvatar) {
      media.className = "ui-avatar root-command-avatar"
      const image = document.createElement("img")
      image.src = item.dataset.mentionAvatar
      image.alt = ""
      media.append(image)
    } else {
      media.className = "root-command-emoji"
      media.textContent = item.dataset.mentionIcon ?? ""
    }

    const label = document.createElement("span")
    label.textContent = title

    const remove = document.createElement("span")
    remove.className = "root-mention-chip-remove"
    remove.setAttribute("aria-hidden", "true")
    remove.textContent = "\u00d7"

    button.append(media, label, remove)
    chips.append(button)

    item.dataset.mentionTaken = "true"
    const search = root.querySelector<HTMLInputElement>("[data-mention-search]")
    if (search) {
      search.value = ""
    }
    filterCommandList(root)
    syncMentionRoot(root)
    closeShowcaseMenus()
  })

  document.addEventListener("input", (event) => {
    const target = event.target
    if (!(target instanceof HTMLInputElement) || target.dataset.mentionSearch === undefined) {
      return
    }

    const scope = target.closest<HTMLElement>("[data-command-scope]")
    if (scope) {
      filterCommandList(scope)
    }
  })

  document.querySelectorAll<HTMLElement>("[data-command-scope]").forEach(filterCommandList)
  document.querySelectorAll<HTMLElement>("[data-mention-root]").forEach(syncMentionRoot)
}

function syncSelectShell(shell: HTMLElement): void {
  const native = shell.querySelector<HTMLSelectElement>("[data-select-native]")
  const trigger = shell.querySelector<HTMLElement>("[data-select-trigger]")
  const valueLabel = shell.querySelector<HTMLElement>("[data-select-value]")
  if (!native) {
    return
  }

  const value = native.value
  const option = Array.from(native.options).find((entry) => entry.value === value)
  const placeholderOption = Array.from(native.options).find((entry) => entry.value === "")

  if (valueLabel) {
    valueLabel.textContent =
      option && option.value !== "" ? option.text : placeholderOption?.text ?? ""
  }

  if (trigger) {
    trigger.dataset.placeholder = option && option.value !== "" ? "false" : "true"
  }

  shell.querySelectorAll<HTMLElement>("[data-select-option]").forEach((item) => {
    const selected = item.dataset.selectOptionValue === value
    item.setAttribute("aria-selected", selected ? "true" : "false")
    item.dataset.active = "false"
  })
}

function syncAllSelectShells(): void {
  document.querySelectorAll<HTMLElement>("[data-select]").forEach(syncSelectShell)
}

function selectShellOptions(shell: HTMLElement): HTMLElement[] {
  return Array.from(shell.querySelectorAll<HTMLElement>("[data-select-option]"))
}

function setSelectShellValue(shell: HTMLElement, value: string): void {
  const native = shell.querySelector<HTMLSelectElement>("[data-select-native]")
  if (!native || native.value === value) {
    if (native) {
      syncSelectShell(shell)
    }
    return
  }

  native.value = value
  Array.from(native.options).forEach((option) => {
    option.selected = option.value === value
  })
  syncSelectShell(shell)
  native.dispatchEvent(new Event("input", { bubbles: true }))
  native.dispatchEvent(new Event("change", { bubbles: true }))
}

function moveSelectShellActive(shell: HTMLElement, delta: number): void {
  const options = selectShellOptions(shell).filter((option) => !option.hidden)
  if (options.length === 0) {
    return
  }

  const currentIndex = options.findIndex((option) => option.dataset.active === "true")
  const selectedIndex = options.findIndex(
    (option) => option.getAttribute("aria-selected") === "true",
  )
  const base = currentIndex >= 0 ? currentIndex : selectedIndex >= 0 ? selectedIndex : 0
  const nextIndex = Math.min(options.length - 1, Math.max(0, base + delta))

  options.forEach((option, index) => {
    option.dataset.active = index === nextIndex ? "true" : "false"
  })
  options[nextIndex].scrollIntoView({ block: "nearest" })
}

function wireShowcaseSelects(): void {
  document.addEventListener("click", (event) => {
    const target = event.target
    if (!(target instanceof Element)) {
      return
    }

    const option = target.closest<HTMLElement>("[data-select-option]")
    const shell = option?.closest<HTMLElement>("[data-select]")
    if (!option || !shell) {
      return
    }

    event.preventDefault()
    setSelectShellValue(shell, option.dataset.selectOptionValue ?? "")
    closeShowcaseMenus()
  })

  document.addEventListener("keydown", (event) => {
    const target = event.target
    if (!(target instanceof HTMLElement)) {
      return
    }

    const shell = target.closest<HTMLElement>("[data-select]")
    if (!shell || !target.closest("[data-select-trigger]")) {
      return
    }

    const panel = shell.querySelector<HTMLElement>("[data-menu-panel]")
    if (!panel) {
      return
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      if (panel.hidden) {
        target.click()
        return
      }
      moveSelectShellActive(shell, event.key === "ArrowDown" ? 1 : -1)
      return
    }

    if (event.key === "Home" || event.key === "End") {
      if (panel.hidden) {
        return
      }
      event.preventDefault()
      moveSelectShellActive(shell, event.key === "Home" ? -999 : 999)
      return
    }

    if (event.key === "Enter" || event.key === " ") {
      if (panel.hidden) {
        return
      }
      event.preventDefault()
      const active = selectShellOptions(shell).find((option) => option.dataset.active === "true")
      if (active) {
        setSelectShellValue(shell, active.dataset.selectOptionValue ?? "")
      }
      closeShowcaseMenus()
    }
  })

  document.addEventListener("change", (event) => {
    const target = event.target
    if (!(target instanceof HTMLSelectElement) || target.dataset.selectNative === undefined) {
      return
    }

    const shell = target.closest<HTMLElement>("[data-select]")
    if (shell) {
      syncSelectShell(shell)
    }
  })

  syncAllSelectShells()
}

function wireColorFormatSelectors(): void {
  document.addEventListener("change", (event) => {
    const target = event.target
    if (!(target instanceof HTMLSelectElement) || target.dataset.selectNative === undefined) {
      return
    }

    const grid = target.closest<HTMLElement>(".colors-route-grid")
    if (!grid) {
      return
    }

    grid.dataset.colorFormat = target.value
    grid.querySelectorAll<HTMLElement>("[data-select]").forEach((shell) => {
      const native = shell.querySelector<HTMLSelectElement>("[data-select-native]")
      if (!native || native === target) {
        return
      }

      native.value = target.value
      Array.from(native.options).forEach((option) => {
        option.selected = option.value === target.value
      })
      syncSelectShell(shell)
    })
  })
}

function wireShowcaseTooltips(): void {
  let tooltip: HTMLElement | null = null

  const ensureTooltip = (): HTMLElement => {
    if (!tooltip) {
      tooltip = document.createElement("div")
      tooltip.className = "ui-tooltip"
      tooltip.setAttribute("role", "tooltip")
      tooltip.hidden = true
      document.body.append(tooltip)
    }
    return tooltip
  }

  const hideTooltip = (): void => {
    if (tooltip) {
      tooltip.hidden = true
    }
  }

  const showTooltip = (host: HTMLElement): void => {
    const text = host.dataset.tooltip
    if (!text) {
      return
    }

    const element = ensureTooltip()
    element.textContent = text
    element.hidden = false

    const hostRect = host.getBoundingClientRect()
    const tipRect = element.getBoundingClientRect()
    const margin = 8
    let top = hostRect.top - tipRect.height - 6
    if (top < margin) {
      top = hostRect.bottom + 6
    }

    let left = hostRect.left + hostRect.width / 2 - tipRect.width / 2
    left = Math.min(window.innerWidth - tipRect.width - margin, Math.max(margin, left))

    element.style.top = `${top + window.scrollY}px`
    element.style.left = `${left + window.scrollX}px`
  }

  const resolveHost = (target: EventTarget | null): HTMLElement | null => {
    if (!(target instanceof Element)) {
      return null
    }
    return target.closest<HTMLElement>("[data-tooltip]")
  }

  document.addEventListener("pointerover", (event) => {
    const host = resolveHost(event.target)
    if (host) {
      showTooltip(host)
    }
  })

  document.addEventListener("pointerout", (event) => {
    if (resolveHost(event.target)) {
      hideTooltip()
    }
  })

  document.addEventListener("focusin", (event) => {
    const host = resolveHost(event.target)
    if (host) {
      showTooltip(host)
    }
  })

  document.addEventListener("focusout", hideTooltip)
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      hideTooltip()
    }
  })
  window.addEventListener("scroll", hideTooltip, true)
}

function wireBlockViewer(): void {
  const cache = new Map<string, Array<{ path: string; content: string }>>()

  const renderFile = (card: HTMLElement, index: number): void => {
    const name = card.querySelector<HTMLElement>("[data-block-code]")?.dataset.blockName
    const files = name ? cache.get(name) : undefined
    const source = card.querySelector<HTMLElement>("[data-block-code-source] code")
    if (!files || !source || !files[index]) {
      return
    }

    source.textContent = files[index].content
    card.querySelectorAll<HTMLElement>("[data-block-code-file]").forEach((button, buttonIndex) => {
      const active = buttonIndex === index
      button.classList.toggle("is-active", active)
      button.setAttribute("aria-selected", active ? "true" : "false")
    })
  }

  const loadFiles = async (card: HTMLElement): Promise<void> => {
    const panel = card.querySelector<HTMLElement>("[data-block-code]")
    const list = card.querySelector<HTMLElement>("[data-block-code-files]")
    const name = panel?.dataset.blockName
    if (!panel || !list || !name) {
      return
    }

    if (!cache.has(name)) {
      try {
        const response = await fetch(`/r/styles/new-york-v4/${name}.json`)
        if (!response.ok) {
          throw new Error(String(response.status))
        }
        const payload = (await response.json()) as {
          files?: Array<{ path?: string; content?: string }>
        }
        cache.set(
          name,
          (payload.files ?? [])
            .filter((file) => typeof file.content === "string")
            .map((file) => ({ path: file.path ?? "", content: file.content ?? "" })),
        )
      } catch {
        cache.set(name, [])
      }
    }

    const files = cache.get(name) ?? []
    if (files.length === 0) {
      const source = card.querySelector<HTMLElement>("[data-block-code-source] code")
      if (source) {
        source.textContent = "Source is not available for this block."
      }
      return
    }

    if (list.childElementCount === 0) {
      list.replaceChildren(
        ...files.map((file, index) => {
          const button = document.createElement("button")
          button.type = "button"
          button.className = index === 0 ? "block-code-file is-active" : "block-code-file"
          button.dataset.blockCodeFile = String(index)
          button.setAttribute("role", "tab")
          button.setAttribute("aria-selected", index === 0 ? "true" : "false")
          button.textContent = file.path.split("/").pop() ?? file.path
          button.title = file.path
          return button
        }),
      )
    }

    renderFile(card, 0)
  }

  document.addEventListener("click", (event) => {
    const target = event.target
    if (!(target instanceof Element)) {
      return
    }

    const fileButton = target.closest<HTMLElement>("[data-block-code-file]")
    if (fileButton) {
      const card = fileButton.closest<HTMLElement>(".block-display-card")
      if (card) {
        renderFile(card, Number.parseInt(fileButton.dataset.blockCodeFile ?? "0", 10) || 0)
      }
      return
    }

    const tab = target.closest<HTMLElement>("[data-block-view]")
    const card = tab?.closest<HTMLElement>(".block-display-card")
    if (!tab || !card) {
      return
    }

    const view = tab.dataset.blockView
    card.querySelectorAll<HTMLElement>("[data-block-view]").forEach((button) => {
      const active = button === tab
      button.classList.toggle("is-active", active)
      button.setAttribute("aria-selected", active ? "true" : "false")
    })

    const preview = card.querySelector<HTMLElement>(".block-preview-stage")
    const code = card.querySelector<HTMLElement>("[data-block-code]")
    if (preview) {
      preview.hidden = view === "code"
    }
    if (code) {
      code.hidden = view !== "code"
    }

    if (view === "code") {
      void loadFiles(card)
    }
  })
}

function wireChartViewer(): void {
  const cache = new Map<string, string>()

  document.addEventListener("click", async (event) => {
    const target = event.target
    if (!(target instanceof Element)) {
      return
    }

    const toggle = target.closest<HTMLElement>("[data-chart-code-toggle]")
    const card = toggle?.closest<HTMLElement>(".chart-display-card")
    const panel = card?.querySelector<HTMLElement>("[data-chart-code]")
    if (!toggle || !card || !panel) {
      return
    }

    const nextOpen = panel.hidden
    panel.hidden = !nextOpen
    toggle.setAttribute("aria-expanded", nextOpen ? "true" : "false")

    const stage = card.querySelector<HTMLElement>(".chart-preview-stage")
    if (stage) {
      stage.hidden = nextOpen
    }

    if (!nextOpen) {
      return
    }

    const name = panel.dataset.chartName
    const source = panel.querySelector<HTMLElement>("[data-chart-code-source] code")
    if (!name || !source) {
      return
    }

    if (!cache.has(name)) {
      try {
        const response = await fetch(`/r/styles/new-york-v4/${name}.json`)
        if (!response.ok) {
          throw new Error(String(response.status))
        }
        const payload = (await response.json()) as {
          files?: Array<{ content?: string }>
        }
        cache.set(name, payload.files?.[0]?.content ?? "")
      } catch {
        cache.set(name, "")
      }
    }

    source.textContent = cache.get(name) || "Source is not available for this chart."
  })
}

function wireClientFilters(): void {
  const filterPairs: Array<{ inputId: string; listSelector: string }> = [
    { inputId: "docs-filter", listSelector: "ul.list-grid" },
    { inputId: "component-filter", listSelector: "ul.pill-grid" },
    { inputId: "example-filter", listSelector: "ul.pill-grid" },
    { inputId: "chart-filter", listSelector: "ul.pill-grid" },
    { inputId: "theme-filter", listSelector: "ul.list-grid" },
  ]

  for (const pair of filterPairs) {
    const input = document.getElementById(pair.inputId)
    if (!(input instanceof HTMLInputElement)) {
      continue
    }

    const list = input.closest("section")?.querySelector(pair.listSelector)
    if (!(list instanceof HTMLElement)) {
      continue
    }

    const applyFilter = () => {
      const normalizedQuery = input.value.trim().toLowerCase()
      const items = list.querySelectorAll(":scope > li")
      for (const item of items) {
        if (!(item instanceof HTMLElement)) {
          continue
        }
        const text = item.textContent?.toLowerCase() ?? ""
        const visible = normalizedQuery.length === 0 || text.includes(normalizedQuery)
        item.style.display = visible ? "" : "none"
      }
    }

    input.addEventListener("input", applyFilter)
  }
}

const colorModeStorageKey = "shadcn-v4-color-mode"
const routeThemeStorageKey = "shadcn-v4-active-theme"
const layoutStorageKey = "layout"
const siteSearchResultCache = new WeakMap<HTMLElement, HTMLElement[]>()

type CreateCatalogKind = "component" | "example" | "block" | "chart"

interface CreateCatalogItem {
  id: string
  title: string
  description: string
  kind: CreateCatalogKind
}

const createCatalogItems: Record<CreateCatalogKind, CreateCatalogItem[]> = {
  component: [
    { id: "button", title: "Button", description: "registry/new-york-v4/ui/button.tsx", kind: "component" },
    { id: "input", title: "Input", description: "registry/new-york-v4/ui/input.tsx", kind: "component" },
    { id: "dialog", title: "Dialog", description: "registry/new-york-v4/ui/dialog.tsx", kind: "component" },
  ],
  example: [
    { id: "dashboard", title: "Dashboard Example", description: "Admin dashboard example using cards, charts, tables, and sidebar layouts.", kind: "example" },
    { id: "tasks", title: "Tasks Example", description: "A task and issue tracker build using Tanstack Table.", kind: "example" },
    { id: "playground", title: "Playground Example", description: "The OpenAI Playground built using the components.", kind: "example" },
  ],
  block: [
    { id: "dashboard-01", title: "Dashboard 01", description: "Dense dashboard block with sidebar chrome and analytics surfaces.", kind: "block" },
    { id: "sidebar-07", title: "Sidebar 07", description: "A navigational shell with projects, teams, and user rails.", kind: "block" },
    { id: "login-03", title: "Login 03", description: "Authentication block with split-brand layout and simple form framing.", kind: "block" },
  ],
  chart: [
    { id: "chart-area-interactive", title: "Area Chart", description: "Interactive area chart with compact dashboard framing.", kind: "chart" },
    { id: "chart-bar-interactive", title: "Bar Chart", description: "Interactive bar chart with grouped metrics and hover states.", kind: "chart" },
    { id: "chart-line-interactive", title: "Line Chart", description: "Interactive line chart for compact trend inspection.", kind: "chart" },
  ],
}

const createKindLabels: Record<CreateCatalogKind, string> = {
  component: "Components",
  example: "Examples",
  block: "Blocks",
  chart: "Charts",
}

const createDefaultItemIds: Record<CreateCatalogKind, string> = {
  component: "button",
  example: "dashboard",
  block: "dashboard-01",
  chart: "chart-area-interactive",
}

void initResumableClient()

function wireColorModeManager(): void {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

  const syncMode = () => {
    applyDocumentColorMode(resolvePreferredColorMode())
  }

  syncMode()
  mediaQuery.addEventListener("change", () => {
    if (resolveStoredColorMode()) {
      return
    }

    syncMode()
  })

  document.addEventListener("keydown", (event) => {
    const isToggleShortcut = (event.key === "d" || event.key === "D") && !event.metaKey && !event.ctrlKey && !event.altKey
    if (!isToggleShortcut || isEditableTarget(event.target)) {
      return
    }

    event.preventDefault()
    toggleDocumentColorMode()
  })
}

function wireSiteChrome(): void {
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return
    }

    const themeCodeClose = document.querySelector<HTMLButtonElement>(
      "[data-theme-code-dialog] .theme-code-close",
    )
    if (themeCodeClose) {
      event.preventDefault()
      themeCodeClose.click()
    }
  })

  document.addEventListener("click", (event) => {
    const target = event.target
    if (!(target instanceof Element)) {
      return
    }

    if (target.closest(".header-layout-toggle")) {
      event.preventDefault()
      toggleDocumentLayout()
      syncLayoutToggleButtons()
      return
    }

    const themePill = target.closest(".theme-customizer-pill")
    if (themePill instanceof HTMLButtonElement) {
      event.preventDefault()
      const themeName = themePill.dataset.themeName
      if (themeName) {
        applyActiveTheme(themeName, true)
      }
    }
  })

  document.addEventListener("input", (event) => {
    const input = event.target
    if (!(input instanceof HTMLInputElement) || input.id !== "site-search-input") {
      return
    }

    const dialog = input.closest(".site-search-dialog")
    if (!(dialog instanceof HTMLElement)) {
      return
    }

    const resultsRoot = dialog.querySelector(".site-search-results")
    if (!(resultsRoot instanceof HTMLElement)) {
      return
    }

    let allResults = siteSearchResultCache.get(dialog)
    if (!allResults) {
      allResults = Array.from(resultsRoot.querySelectorAll<HTMLElement>(".site-search-result"))
      siteSearchResultCache.set(dialog, allResults)
    }

    const normalizedQuery = input.value.trim().toLowerCase()
    const exactMatches = normalizedQuery.length === 0
      ? []
      : allResults.filter((result) => result.dataset.searchTitle === normalizedQuery)
    const visibleResults = (normalizedQuery.length === 0
      ? allResults
      : exactMatches.length > 0
        ? exactMatches
        : allResults.filter((result) => (result.dataset.searchText || "").includes(normalizedQuery))
    ).slice(0, normalizedQuery.length === 0 ? 10 : 12)
    visibleResults.forEach((result) => {
      result.hidden = false
    })
    resultsRoot.replaceChildren(...visibleResults)

    const emptyState = dialog.querySelector(".site-search-empty")
    if (emptyState instanceof HTMLElement) {
      emptyState.hidden = visibleResults.length > 0
    }
  })

  document.addEventListener("keydown", (event) => {
    const isSearchShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k"
    if (isSearchShortcut) {
      event.preventDefault()
      document.querySelector<HTMLButtonElement>(".header-search-button")?.click()
      return
    }

    if (event.key !== "Escape") {
      return
    }

    const searchClose = document.querySelector<HTMLButtonElement>(".site-search-close")
    if (searchClose) {
      searchClose.click()
      return
    }

    document.querySelector<HTMLElement>(".mobile-nav-overlay")?.click()
  })
}

function wireThemeExperience(): void {
  const themeName = resolveInitialThemeName()
  applyActiveTheme(themeName, false)

  document.addEventListener("change", (event) => {
    const target = event.target
    if (!(target instanceof HTMLSelectElement)) {
      return
    }

    if (target.id !== "theme-selector" && target.id !== "themes-route-selector") {
      return
    }

    applyActiveTheme(target.value, true)
  })
}

function wireCreateRoute(): void {
  const routeShell = document.querySelector(".create-route-shell")
  if (!(routeShell instanceof HTMLElement)) {
    return
  }

  const filterInput = document.getElementById("create-item-filter")
  const list = routeShell.querySelector(".create-explorer-list")
  const groupTitle = routeShell.querySelector(".create-explorer-group-head h2")
  const groupCount = routeShell.querySelector(".create-explorer-group-head span")
  const previewTitle = routeShell.querySelector(".create-preview-header h2")
  const previewDescription = routeShell.querySelector(".create-preview-copy")
  const commandCode = routeShell.querySelector(".create-command-code code")
  const previewStageShell = routeShell.querySelector(".create-preview-stage-shell")
  const badgeSpans = routeShell.querySelectorAll(".create-preview-badges span")
  if (!(filterInput instanceof HTMLInputElement) || !(list instanceof HTMLElement) || !(groupTitle instanceof HTMLElement) ||
    !(groupCount instanceof HTMLElement) || !(previewTitle instanceof HTMLElement) || !(previewDescription instanceof HTMLElement) ||
    !(commandCode instanceof HTMLElement) || !(previewStageShell instanceof HTMLElement) || badgeSpans.length < 4) {
    return
  }

  const initialStageMarkup = previewStageShell.innerHTML
  const state = {
    kind: "component" as CreateCatalogKind,
    itemId: "button",
    base: "radix",
    theme: "neutral",
    font: "inter",
    template: "next",
  }

  const getActiveItems = (): CreateCatalogItem[] => createCatalogItems[state.kind]
  const getActiveItem = (): CreateCatalogItem => getActiveItems().find((item) => item.id === state.itemId) || getActiveItems()[0]

  const renderList = () => {
    const normalizedQuery = filterInput.value.trim().toLowerCase()
    const activeItems = getActiveItems()
    const visibleItems = activeItems.filter((item) => {
      if (!normalizedQuery) {
        return true
      }

      return `${item.title} ${item.id} ${item.description}`.toLowerCase().includes(normalizedQuery)
    })

    groupTitle.textContent = createKindLabels[state.kind]
    groupCount.textContent = String(activeItems.length)
    list.innerHTML = visibleItems.length
      ? visibleItems.map((item) => {
        const isActive = item.id === state.itemId
        return `<button type="button" class="${isActive ? "create-item-button is-active" : "create-item-button"}" data-item-id="${item.id}"><span class="create-item-title">${escapeHtml(item.title)}</span><span class="create-item-description">${escapeHtml(item.description)}</span></button>`
      }).join("")
      : '<p class="create-empty-state">No matching items.</p>'
  }

  const renderPreview = async () => {
    const activeItem = getActiveItem()
    previewTitle.textContent = activeItem.title
    previewDescription.textContent = activeItem.description
    badgeSpans[0].textContent = state.base
    badgeSpans[1].textContent = state.theme
    badgeSpans[2].textContent = state.font
    badgeSpans[3].textContent = state.template
    commandCode.textContent = buildCreateInstallCommand(state, activeItem)

    if (state.kind === "component" && state.itemId === "button") {
      previewStageShell.innerHTML = initialStageMarkup
      return
    }

    if (state.kind === "example") {
      previewStageShell.innerHTML = '<div class="create-preview-stage create-preview-stage-example"><div class="example-fallback"><h3>Loading preview...</h3></div></div>'
      const previewStage = previewStageShell.querySelector(".create-preview-stage")
      if (!(previewStage instanceof HTMLElement)) {
        return
      }

      try {
        const response = await fetch(`/examples/${state.itemId}`)
        if (!response.ok) {
          throw new Error(`Failed to load example ${state.itemId}`)
        }

        const html = await response.text()
        const parsed = new DOMParser().parseFromString(html, "text/html")
        const preview = parsed.querySelector(".example-live-stage > *") || parsed.querySelector(".tasks-example")
        if (preview instanceof HTMLElement) {
          previewStage.innerHTML = preview.outerHTML
          return
        }
      } catch {
      }
    }

    previewStageShell.innerHTML = `<div class="create-preview-stage"><div class="example-fallback"><h3>${escapeHtml(activeItem.title)}</h3><p>${escapeHtml(activeItem.description)}</p></div></div>`
  }

  const renderControls = () => {
    routeShell.querySelectorAll<HTMLButtonElement>(".create-kind-pills .create-kind-pill").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.kind === state.kind)
    })

    routeShell.querySelectorAll<HTMLButtonElement>(".create-option-group").forEach((group) => {
      const heading = group.querySelector("h3")?.textContent?.trim()
      const activeValue = heading === "Base"
        ? state.base
        : heading === "Theme"
          ? state.theme
          : heading === "Font"
            ? state.font
            : heading === "Template"
              ? state.template
              : ""

      group.querySelectorAll<HTMLButtonElement>(".create-option-card").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.value === activeValue)
      })
    })
  }

  const render = async () => {
    renderControls()
    renderList()
    await renderPreview()
  }

  routeShell.addEventListener("click", (event) => {
    const target = event.target
    if (!(target instanceof Element)) {
      return
    }

    const kindButton = target.closest(".create-kind-pill")
    if (kindButton instanceof HTMLButtonElement) {
      const nextKind = kindButton.dataset.kind as CreateCatalogKind | undefined
      if (!nextKind) {
        return
      }

      state.kind = nextKind
      state.itemId = createDefaultItemIds[nextKind]
      void render()
      return
    }

    const itemButton = target.closest(".create-item-button")
    if (itemButton instanceof HTMLButtonElement) {
      const nextItemId = itemButton.dataset.itemId
      if (!nextItemId) {
        return
      }

      state.itemId = nextItemId
      void render()
      return
    }

    const optionButton = target.closest(".create-option-card")
    if (optionButton instanceof HTMLButtonElement) {
      const nextValue = optionButton.dataset.value
      if (!nextValue) {
        return
      }

      const groupHeading = optionButton.closest(".create-option-group")?.querySelector("h3")?.textContent?.trim()
      if (groupHeading === "Base") {
        state.base = nextValue
      } else if (groupHeading === "Theme") {
        state.theme = nextValue
      } else if (groupHeading === "Font") {
        state.font = nextValue
      } else if (groupHeading === "Template") {
        state.template = nextValue
      }

      void render()
    }
  })

  filterInput.addEventListener("input", () => {
    renderList()
  })

  void render()
}

function resolveInitialThemeName(): string {
  const storageTheme = window.localStorage.getItem(routeThemeStorageKey)
  if (storageTheme) {
    return storageTheme
  }

  const themedElement = document.querySelector<HTMLElement>(".theme-preview-stage, .route-theme-container, .home-preview-shell")
  return themedElement?.dataset.themeName || "amber"
}

function applyActiveTheme(themeName: string, persist: boolean): void {
  document.body.dataset.activeTheme = themeName
  if (persist) {
    window.localStorage.setItem(routeThemeStorageKey, themeName)
  }

  document.querySelectorAll<HTMLElement>(".home-preview-shell, .route-theme-container, .theme-preview-stage").forEach((element) => {
    element.dataset.themeName = themeName
  })

  document.querySelectorAll<HTMLSelectElement>("#theme-selector, #themes-route-selector").forEach((select) => {
    select.value = themeName
    select.dataset.activeTheme = themeName
    Array.from(select.options).forEach((option) => {
      option.selected = option.value === themeName
    })
  })

  document.querySelectorAll<HTMLElement>("[data-select]").forEach((shell) => {
    const native = shell.querySelector<HTMLSelectElement>("[data-select-native]")
    if (native && (native.id === "theme-selector" || native.id === "themes-route-selector")) {
      syncSelectShell(shell)
    }
  })

  document.querySelectorAll<HTMLElement>(".theme-selector-copy, .theme-copy-button").forEach((button) => {
    button.dataset.themeName = themeName
  })

  document.querySelectorAll<HTMLElement>(".theme-customizer-pill").forEach((button) => {
    button.dataset.active = button.dataset.themeName === themeName ? "true" : "false"
  })
}

function buildCreateInstallCommand(
  state: { kind: CreateCatalogKind; itemId: string; base: string; theme: string; font: string; template: string },
  activeItem: CreateCatalogItem,
): string {
  const target = activeItem.kind === "example" ? `registry/new-york-v4/examples/${activeItem.id}` : activeItem.id
  return `pnpm dlx @fictjs/shadcn@latest init --template ${state.template} --base ${state.base}\npnpm dlx @fictjs/shadcn@latest theme apply ${state.theme}\npnpm dlx @fictjs/shadcn@latest add ${target} --font ${state.font}`
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
}

function resolveStoredColorMode(): "light" | "dark" | null {
  const storedMode = window.localStorage.getItem(colorModeStorageKey)
  return storedMode === "light" || storedMode === "dark" ? storedMode : null
}

function resolveStoredLayout(): "fixed" | "full" | null {
  if (!window.localStorage) {
    return null
  }

  const storedLayout = window.localStorage.getItem(layoutStorageKey)
  return storedLayout === "fixed" || storedLayout === "full" ? storedLayout : null
}

function resolvePreferredColorMode(): "light" | "dark" {
  const storedMode = resolveStoredColorMode()
  if (storedMode) {
    return storedMode
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyDocumentColorMode(mode: "light" | "dark"): void {
  document.documentElement.classList.toggle("dark", mode === "dark")
  document.documentElement.dataset.colorMode = mode
  document.documentElement.style.colorScheme = mode
}

function applyDocumentLayout(layout: "fixed" | "full"): void {
  document.documentElement.classList.toggle("layout-fixed", layout === "fixed")
  document.documentElement.classList.toggle("layout-full", layout === "full")
  document.documentElement.dataset.layout = layout
}

function toggleDocumentColorMode(): void {
  const nextMode = document.documentElement.classList.contains("dark") ? "light" : "dark"
  applyDocumentColorMode(nextMode)
  window.localStorage.setItem(colorModeStorageKey, nextMode)
}

function wireLayoutManager(): void {
  applyDocumentLayout(resolveStoredLayout() || "full")
  syncLayoutToggleButtons()
}

function syncLayoutToggleButtons(): void {
  const layout = document.documentElement.classList.contains("layout-fixed") ? "fixed" : "full"
  document.querySelectorAll<HTMLElement>(".header-layout-toggle").forEach((button) => {
    button.dataset.layoutMode = layout
  })
}

function toggleDocumentLayout(): void {
  const nextLayout = document.documentElement.classList.contains("layout-fixed") ? "full" : "fixed"
  applyDocumentLayout(nextLayout)
  window.localStorage.setItem(layoutStorageKey, nextLayout)
}

function isEditableTarget(target: EventTarget | null): boolean {
  return (
    (target instanceof HTMLElement && target.isContentEditable) ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  )
}
