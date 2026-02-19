/** @jsxImportSource fict */

import { DEFAULT_CONFIG } from '../src/core/constants'
import { builtinBlocks, builtinComponents, builtinThemes } from '../src/registry/builtin'

import { renderFict } from './render-fict'

const meta = {
  title: 'Fict Shadcn/Builtin Registry',
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

const templateContext = {
  config: DEFAULT_CONFIG,
  imports: {
    cn: '@/lib/cn',
    variants: '@/lib/variants',
  },
  aliasFor: relativePath => '@/' + relativePath,
  uiImport: componentName => '@/components/ui/' + componentName,
}

const entryRegistry = {
  component: new Map(builtinComponents.map(entry => [entry.name, entry])),
  block: new Map(builtinBlocks.map(entry => [entry.name, entry])),
  theme: new Map(builtinThemes.map(entry => [entry.name, entry])),
}

function getRegistryEntry(kind, name) {
  const entry = entryRegistry[kind].get(name)
  if (!entry) {
    throw new Error('Unknown registry entry: ' + kind + '/' + name)
  }
  return entry
}

function renderRegistryEntry(kind, name) {
  const entry = getRegistryEntry(kind, name)
  const files = entry.files.map(file => ({
    path: file.path,
    content: file.content(templateContext),
  }))

  return renderFict(() => (
    <div class='min-h-screen w-full bg-background p-6 text-foreground'>
      <div class='mx-auto grid w-full max-w-6xl gap-4'>
        <header class='rounded-lg border bg-card p-4'>
          <p class='text-xs uppercase tracking-wider text-muted-foreground'>{kind}</p>
          <h1 class='mt-1 text-xl font-semibold'>{entry.name}</h1>
          <p class='mt-1 text-sm text-muted-foreground'>{entry.description}</p>
          <div class='mt-3 flex flex-wrap gap-2'>
            <span class='rounded border px-2 py-1 text-xs'>version: {entry.version}</span>
            <span class='rounded border px-2 py-1 text-xs'>files: {files.length}</span>
            <span class='rounded border px-2 py-1 text-xs'>deps: {entry.dependencies.length}</span>
            <span class='rounded border px-2 py-1 text-xs'>registry deps: {entry.registryDependencies.length}</span>
          </div>
        </header>

        {files.map(file => (
          <section class='overflow-hidden rounded-lg border bg-card'>
            <div class='border-b px-4 py-2 text-xs text-muted-foreground'>{file.path}</div>
            <pre class='max-h-[500px] overflow-auto p-4 text-xs leading-relaxed'>
              <code>{file.content}</code>
            </pre>
          </section>
        ))}
      </div>
    </div>
  ))
}

function createRegistryStory(kind, name) {
  return {
    name: kind + '/' + name,
    render: () => renderRegistryEntry(kind, name),
  }
}

export const ComponentAccordion = createRegistryStory('component', 'accordion')
export const ComponentAlert = createRegistryStory('component', 'alert')
export const ComponentAlertDialog = createRegistryStory('component', 'alert-dialog')
export const ComponentAspectRatio = createRegistryStory('component', 'aspect-ratio')
export const ComponentAvatar = createRegistryStory('component', 'avatar')
export const ComponentBadge = createRegistryStory('component', 'badge')
export const ComponentBreadcrumb = createRegistryStory('component', 'breadcrumb')
export const ComponentButton = createRegistryStory('component', 'button')
export const ComponentButtonGroup = createRegistryStory('component', 'button-group')
export const ComponentCalendar = createRegistryStory('component', 'calendar')
export const ComponentCard = createRegistryStory('component', 'card')
export const ComponentCarousel = createRegistryStory('component', 'carousel')
export const ComponentChart = createRegistryStory('component', 'chart')
export const ComponentCheckbox = createRegistryStory('component', 'checkbox')
export const ComponentCollapsible = createRegistryStory('component', 'collapsible')
export const ComponentCombobox = createRegistryStory('component', 'combobox')
export const ComponentCommand = createRegistryStory('component', 'command')
export const ComponentContextMenu = createRegistryStory('component', 'context-menu')
export const ComponentDataTable = createRegistryStory('component', 'data-table')
export const ComponentDialog = createRegistryStory('component', 'dialog')
export const ComponentDrawer = createRegistryStory('component', 'drawer')
export const ComponentDropdownMenu = createRegistryStory('component', 'dropdown-menu')
export const ComponentEmpty = createRegistryStory('component', 'empty')
export const ComponentField = createRegistryStory('component', 'field')
export const ComponentForm = createRegistryStory('component', 'form')
export const ComponentHoverCard = createRegistryStory('component', 'hover-card')
export const ComponentInput = createRegistryStory('component', 'input')
export const ComponentInputGroup = createRegistryStory('component', 'input-group')
export const ComponentInputOtp = createRegistryStory('component', 'input-otp')
export const ComponentIsMobile = createRegistryStory('component', 'is-mobile')
export const ComponentItem = createRegistryStory('component', 'item')
export const ComponentKbd = createRegistryStory('component', 'kbd')
export const ComponentLabel = createRegistryStory('component', 'label')
export const ComponentMenubar = createRegistryStory('component', 'menubar')
export const ComponentNativeSelect = createRegistryStory('component', 'native-select')
export const ComponentNavigationMenu = createRegistryStory('component', 'navigation-menu')
export const ComponentPagination = createRegistryStory('component', 'pagination')
export const ComponentPopover = createRegistryStory('component', 'popover')
export const ComponentProgress = createRegistryStory('component', 'progress')
export const ComponentRadioGroup = createRegistryStory('component', 'radio-group')
export const ComponentRangeCalendar = createRegistryStory('component', 'range-calendar')
export const ComponentResizable = createRegistryStory('component', 'resizable')
export const ComponentScrollArea = createRegistryStory('component', 'scroll-area')
export const ComponentSelect = createRegistryStory('component', 'select')
export const ComponentSeparator = createRegistryStory('component', 'separator')
export const ComponentSheet = createRegistryStory('component', 'sheet')
export const ComponentSidebar = createRegistryStory('component', 'sidebar')
export const ComponentSkeleton = createRegistryStory('component', 'skeleton')
export const ComponentSlider = createRegistryStory('component', 'slider')
export const ComponentSonner = createRegistryStory('component', 'sonner')
export const ComponentSpinner = createRegistryStory('component', 'spinner')
export const ComponentSwitch = createRegistryStory('component', 'switch')
export const ComponentTable = createRegistryStory('component', 'table')
export const ComponentTabs = createRegistryStory('component', 'tabs')
export const ComponentTextarea = createRegistryStory('component', 'textarea')
export const ComponentToast = createRegistryStory('component', 'toast')
export const ComponentToggle = createRegistryStory('component', 'toggle')
export const ComponentToggleGroup = createRegistryStory('component', 'toggle-group')
export const ComponentTooltip = createRegistryStory('component', 'tooltip')
export const ComponentUtils = createRegistryStory('component', 'utils')
export const BlockAuthLoginForm = createRegistryStory('block', 'auth/login-form')
export const BlockAuthSignupForm = createRegistryStory('block', 'auth/signup-form')
export const BlockCalendar01 = createRegistryStory('block', 'calendar-01')
export const BlockCalendar02 = createRegistryStory('block', 'calendar-02')
export const BlockCalendar03 = createRegistryStory('block', 'calendar-03')
export const BlockCalendar04 = createRegistryStory('block', 'calendar-04')
export const BlockCalendar05 = createRegistryStory('block', 'calendar-05')
export const BlockCalendar06 = createRegistryStory('block', 'calendar-06')
export const BlockCalendar07 = createRegistryStory('block', 'calendar-07')
export const BlockCalendar08 = createRegistryStory('block', 'calendar-08')
export const BlockCalendar09 = createRegistryStory('block', 'calendar-09')
export const BlockCalendar10 = createRegistryStory('block', 'calendar-10')
export const BlockCalendar11 = createRegistryStory('block', 'calendar-11')
export const BlockCalendar12 = createRegistryStory('block', 'calendar-12')
export const BlockCalendar13 = createRegistryStory('block', 'calendar-13')
export const BlockCalendar14 = createRegistryStory('block', 'calendar-14')
export const BlockCalendar15 = createRegistryStory('block', 'calendar-15')
export const BlockCalendar16 = createRegistryStory('block', 'calendar-16')
export const BlockCalendar17 = createRegistryStory('block', 'calendar-17')
export const BlockCalendar18 = createRegistryStory('block', 'calendar-18')
export const BlockCalendar19 = createRegistryStory('block', 'calendar-19')
export const BlockCalendar20 = createRegistryStory('block', 'calendar-20')
export const BlockCalendar21 = createRegistryStory('block', 'calendar-21')
export const BlockCalendar22 = createRegistryStory('block', 'calendar-22')
export const BlockCalendar23 = createRegistryStory('block', 'calendar-23')
export const BlockCalendar24 = createRegistryStory('block', 'calendar-24')
export const BlockCalendar25 = createRegistryStory('block', 'calendar-25')
export const BlockCalendar26 = createRegistryStory('block', 'calendar-26')
export const BlockCalendar27 = createRegistryStory('block', 'calendar-27')
export const BlockCalendar28 = createRegistryStory('block', 'calendar-28')
export const BlockCalendar29 = createRegistryStory('block', 'calendar-29')
export const BlockCalendar30 = createRegistryStory('block', 'calendar-30')
export const BlockCalendar31 = createRegistryStory('block', 'calendar-31')
export const BlockCalendar32 = createRegistryStory('block', 'calendar-32')
export const BlockChartAreaAxes = createRegistryStory('block', 'chart-area-axes')
export const BlockChartAreaDefault = createRegistryStory('block', 'chart-area-default')
export const BlockChartAreaGradient = createRegistryStory('block', 'chart-area-gradient')
export const BlockChartAreaIcons = createRegistryStory('block', 'chart-area-icons')
export const BlockChartAreaInteractive = createRegistryStory('block', 'chart-area-interactive')
export const BlockChartAreaLegend = createRegistryStory('block', 'chart-area-legend')
export const BlockChartAreaLinear = createRegistryStory('block', 'chart-area-linear')
export const BlockChartAreaStacked = createRegistryStory('block', 'chart-area-stacked')
export const BlockChartAreaStackedExpand = createRegistryStory('block', 'chart-area-stacked-expand')
export const BlockChartAreaStep = createRegistryStory('block', 'chart-area-step')
export const BlockChartBarActive = createRegistryStory('block', 'chart-bar-active')
export const BlockChartBarDefault = createRegistryStory('block', 'chart-bar-default')
export const BlockChartBarHorizontal = createRegistryStory('block', 'chart-bar-horizontal')
export const BlockChartBarInteractive = createRegistryStory('block', 'chart-bar-interactive')
export const BlockChartBarLabel = createRegistryStory('block', 'chart-bar-label')
export const BlockChartBarLabelCustom = createRegistryStory('block', 'chart-bar-label-custom')
export const BlockChartBarMixed = createRegistryStory('block', 'chart-bar-mixed')
export const BlockChartBarMultiple = createRegistryStory('block', 'chart-bar-multiple')
export const BlockChartBarNegative = createRegistryStory('block', 'chart-bar-negative')
export const BlockChartBarStacked = createRegistryStory('block', 'chart-bar-stacked')
export const BlockChartLineDefault = createRegistryStory('block', 'chart-line-default')
export const BlockChartLineDots = createRegistryStory('block', 'chart-line-dots')
export const BlockChartLineDotsColors = createRegistryStory('block', 'chart-line-dots-colors')
export const BlockChartLineDotsCustom = createRegistryStory('block', 'chart-line-dots-custom')
export const BlockChartLineInteractive = createRegistryStory('block', 'chart-line-interactive')
export const BlockChartLineLabel = createRegistryStory('block', 'chart-line-label')
export const BlockChartLineLabelCustom = createRegistryStory('block', 'chart-line-label-custom')
export const BlockChartLineLinear = createRegistryStory('block', 'chart-line-linear')
export const BlockChartLineMultiple = createRegistryStory('block', 'chart-line-multiple')
export const BlockChartLineStep = createRegistryStory('block', 'chart-line-step')
export const BlockChartPieDonut = createRegistryStory('block', 'chart-pie-donut')
export const BlockChartPieDonutActive = createRegistryStory('block', 'chart-pie-donut-active')
export const BlockChartPieDonutText = createRegistryStory('block', 'chart-pie-donut-text')
export const BlockChartPieInteractive = createRegistryStory('block', 'chart-pie-interactive')
export const BlockChartPieLabel = createRegistryStory('block', 'chart-pie-label')
export const BlockChartPieLabelCustom = createRegistryStory('block', 'chart-pie-label-custom')
export const BlockChartPieLabelList = createRegistryStory('block', 'chart-pie-label-list')
export const BlockChartPieLegend = createRegistryStory('block', 'chart-pie-legend')
export const BlockChartPieSeparatorNone = createRegistryStory('block', 'chart-pie-separator-none')
export const BlockChartPieSimple = createRegistryStory('block', 'chart-pie-simple')
export const BlockChartPieStacked = createRegistryStory('block', 'chart-pie-stacked')
export const BlockChartRadarDefault = createRegistryStory('block', 'chart-radar-default')
export const BlockChartRadarDots = createRegistryStory('block', 'chart-radar-dots')
export const BlockChartRadarGridCircle = createRegistryStory('block', 'chart-radar-grid-circle')
export const BlockChartRadarGridCircleFill = createRegistryStory('block', 'chart-radar-grid-circle-fill')
export const BlockChartRadarGridCircleNoLines = createRegistryStory('block', 'chart-radar-grid-circle-no-lines')
export const BlockChartRadarGridCustom = createRegistryStory('block', 'chart-radar-grid-custom')
export const BlockChartRadarGridFill = createRegistryStory('block', 'chart-radar-grid-fill')
export const BlockChartRadarGridNone = createRegistryStory('block', 'chart-radar-grid-none')
export const BlockChartRadarIcons = createRegistryStory('block', 'chart-radar-icons')
export const BlockChartRadarLabelCustom = createRegistryStory('block', 'chart-radar-label-custom')
export const BlockChartRadarLegend = createRegistryStory('block', 'chart-radar-legend')
export const BlockChartRadarLinesOnly = createRegistryStory('block', 'chart-radar-lines-only')
export const BlockChartRadarMultiple = createRegistryStory('block', 'chart-radar-multiple')
export const BlockChartRadarRadius = createRegistryStory('block', 'chart-radar-radius')
export const BlockChartRadialGrid = createRegistryStory('block', 'chart-radial-grid')
export const BlockChartRadialLabel = createRegistryStory('block', 'chart-radial-label')
export const BlockChartRadialShape = createRegistryStory('block', 'chart-radial-shape')
export const BlockChartRadialSimple = createRegistryStory('block', 'chart-radial-simple')
export const BlockChartRadialStacked = createRegistryStory('block', 'chart-radial-stacked')
export const BlockChartRadialText = createRegistryStory('block', 'chart-radial-text')
export const BlockChartTooltipAdvanced = createRegistryStory('block', 'chart-tooltip-advanced')
export const BlockChartTooltipDefault = createRegistryStory('block', 'chart-tooltip-default')
export const BlockChartTooltipFormatter = createRegistryStory('block', 'chart-tooltip-formatter')
export const BlockChartTooltipIcons = createRegistryStory('block', 'chart-tooltip-icons')
export const BlockChartTooltipIndicatorLine = createRegistryStory('block', 'chart-tooltip-indicator-line')
export const BlockChartTooltipIndicatorNone = createRegistryStory('block', 'chart-tooltip-indicator-none')
export const BlockChartTooltipLabelCustom = createRegistryStory('block', 'chart-tooltip-label-custom')
export const BlockChartTooltipLabelFormatter = createRegistryStory('block', 'chart-tooltip-label-formatter')
export const BlockChartTooltipLabelNone = createRegistryStory('block', 'chart-tooltip-label-none')
export const BlockDashboard01 = createRegistryStory('block', 'dashboard-01')
export const BlockDashboardLayout = createRegistryStory('block', 'dashboard/layout')
export const BlockDashboardSidebar = createRegistryStory('block', 'dashboard/sidebar')
export const BlockDemoSidebar = createRegistryStory('block', 'demo-sidebar')
export const BlockDemoSidebarControlled = createRegistryStory('block', 'demo-sidebar-controlled')
export const BlockDemoSidebarFooter = createRegistryStory('block', 'demo-sidebar-footer')
export const BlockDemoSidebarGroup = createRegistryStory('block', 'demo-sidebar-group')
export const BlockDemoSidebarGroupAction = createRegistryStory('block', 'demo-sidebar-group-action')
export const BlockDemoSidebarGroupCollapsible = createRegistryStory('block', 'demo-sidebar-group-collapsible')
export const BlockDemoSidebarHeader = createRegistryStory('block', 'demo-sidebar-header')
export const BlockDemoSidebarMenu = createRegistryStory('block', 'demo-sidebar-menu')
export const BlockDemoSidebarMenuAction = createRegistryStory('block', 'demo-sidebar-menu-action')
export const BlockDemoSidebarMenuBadge = createRegistryStory('block', 'demo-sidebar-menu-badge')
export const BlockDemoSidebarMenuCollapsible = createRegistryStory('block', 'demo-sidebar-menu-collapsible')
export const BlockDemoSidebarMenuSub = createRegistryStory('block', 'demo-sidebar-menu-sub')
export const BlockDialogsConfirmDelete = createRegistryStory('block', 'dialogs/confirm-delete')
export const BlockFormsValidatedForm = createRegistryStory('block', 'forms/validated-form')
export const BlockLogin01 = createRegistryStory('block', 'login-01')
export const BlockLogin02 = createRegistryStory('block', 'login-02')
export const BlockLogin03 = createRegistryStory('block', 'login-03')
export const BlockLogin04 = createRegistryStory('block', 'login-04')
export const BlockLogin05 = createRegistryStory('block', 'login-05')
export const BlockNewComponents01 = createRegistryStory('block', 'new-components-01')
export const BlockOtp01 = createRegistryStory('block', 'otp-01')
export const BlockOtp02 = createRegistryStory('block', 'otp-02')
export const BlockOtp03 = createRegistryStory('block', 'otp-03')
export const BlockOtp04 = createRegistryStory('block', 'otp-04')
export const BlockOtp05 = createRegistryStory('block', 'otp-05')
export const BlockSettingsProfile = createRegistryStory('block', 'settings/profile')
export const BlockSidebar01 = createRegistryStory('block', 'sidebar-01')
export const BlockSidebar02 = createRegistryStory('block', 'sidebar-02')
export const BlockSidebar03 = createRegistryStory('block', 'sidebar-03')
export const BlockSidebar04 = createRegistryStory('block', 'sidebar-04')
export const BlockSidebar05 = createRegistryStory('block', 'sidebar-05')
export const BlockSidebar06 = createRegistryStory('block', 'sidebar-06')
export const BlockTablesUsersTable = createRegistryStory('block', 'tables/users-table')
export const ThemeInit = createRegistryStory('theme', 'init')
export const ThemeThemeBrandOcean = createRegistryStory('theme', 'theme-brand-ocean')
export const ThemeThemeDefault = createRegistryStory('theme', 'theme-default')
export const ThemeThemeSlate = createRegistryStory('theme', 'theme-slate')
export const ThemeThemeStone = createRegistryStory('theme', 'theme-stone')
export const ThemeThemeZinc = createRegistryStory('theme', 'theme-zinc')

export const __namedExportsOrder = [
  'ComponentAccordion',
  'ComponentAlert',
  'ComponentAlertDialog',
  'ComponentAspectRatio',
  'ComponentAvatar',
  'ComponentBadge',
  'ComponentBreadcrumb',
  'ComponentButton',
  'ComponentButtonGroup',
  'ComponentCalendar',
  'ComponentCard',
  'ComponentCarousel',
  'ComponentChart',
  'ComponentCheckbox',
  'ComponentCollapsible',
  'ComponentCombobox',
  'ComponentCommand',
  'ComponentContextMenu',
  'ComponentDataTable',
  'ComponentDialog',
  'ComponentDrawer',
  'ComponentDropdownMenu',
  'ComponentEmpty',
  'ComponentField',
  'ComponentForm',
  'ComponentHoverCard',
  'ComponentInput',
  'ComponentInputGroup',
  'ComponentInputOtp',
  'ComponentIsMobile',
  'ComponentItem',
  'ComponentKbd',
  'ComponentLabel',
  'ComponentMenubar',
  'ComponentNativeSelect',
  'ComponentNavigationMenu',
  'ComponentPagination',
  'ComponentPopover',
  'ComponentProgress',
  'ComponentRadioGroup',
  'ComponentRangeCalendar',
  'ComponentResizable',
  'ComponentScrollArea',
  'ComponentSelect',
  'ComponentSeparator',
  'ComponentSheet',
  'ComponentSidebar',
  'ComponentSkeleton',
  'ComponentSlider',
  'ComponentSonner',
  'ComponentSpinner',
  'ComponentSwitch',
  'ComponentTable',
  'ComponentTabs',
  'ComponentTextarea',
  'ComponentToast',
  'ComponentToggle',
  'ComponentToggleGroup',
  'ComponentTooltip',
  'ComponentUtils',
  'BlockAuthLoginForm',
  'BlockAuthSignupForm',
  'BlockCalendar01',
  'BlockCalendar02',
  'BlockCalendar03',
  'BlockCalendar04',
  'BlockCalendar05',
  'BlockCalendar06',
  'BlockCalendar07',
  'BlockCalendar08',
  'BlockCalendar09',
  'BlockCalendar10',
  'BlockCalendar11',
  'BlockCalendar12',
  'BlockCalendar13',
  'BlockCalendar14',
  'BlockCalendar15',
  'BlockCalendar16',
  'BlockCalendar17',
  'BlockCalendar18',
  'BlockCalendar19',
  'BlockCalendar20',
  'BlockCalendar21',
  'BlockCalendar22',
  'BlockCalendar23',
  'BlockCalendar24',
  'BlockCalendar25',
  'BlockCalendar26',
  'BlockCalendar27',
  'BlockCalendar28',
  'BlockCalendar29',
  'BlockCalendar30',
  'BlockCalendar31',
  'BlockCalendar32',
  'BlockChartAreaAxes',
  'BlockChartAreaDefault',
  'BlockChartAreaGradient',
  'BlockChartAreaIcons',
  'BlockChartAreaInteractive',
  'BlockChartAreaLegend',
  'BlockChartAreaLinear',
  'BlockChartAreaStacked',
  'BlockChartAreaStackedExpand',
  'BlockChartAreaStep',
  'BlockChartBarActive',
  'BlockChartBarDefault',
  'BlockChartBarHorizontal',
  'BlockChartBarInteractive',
  'BlockChartBarLabel',
  'BlockChartBarLabelCustom',
  'BlockChartBarMixed',
  'BlockChartBarMultiple',
  'BlockChartBarNegative',
  'BlockChartBarStacked',
  'BlockChartLineDefault',
  'BlockChartLineDots',
  'BlockChartLineDotsColors',
  'BlockChartLineDotsCustom',
  'BlockChartLineInteractive',
  'BlockChartLineLabel',
  'BlockChartLineLabelCustom',
  'BlockChartLineLinear',
  'BlockChartLineMultiple',
  'BlockChartLineStep',
  'BlockChartPieDonut',
  'BlockChartPieDonutActive',
  'BlockChartPieDonutText',
  'BlockChartPieInteractive',
  'BlockChartPieLabel',
  'BlockChartPieLabelCustom',
  'BlockChartPieLabelList',
  'BlockChartPieLegend',
  'BlockChartPieSeparatorNone',
  'BlockChartPieSimple',
  'BlockChartPieStacked',
  'BlockChartRadarDefault',
  'BlockChartRadarDots',
  'BlockChartRadarGridCircle',
  'BlockChartRadarGridCircleFill',
  'BlockChartRadarGridCircleNoLines',
  'BlockChartRadarGridCustom',
  'BlockChartRadarGridFill',
  'BlockChartRadarGridNone',
  'BlockChartRadarIcons',
  'BlockChartRadarLabelCustom',
  'BlockChartRadarLegend',
  'BlockChartRadarLinesOnly',
  'BlockChartRadarMultiple',
  'BlockChartRadarRadius',
  'BlockChartRadialGrid',
  'BlockChartRadialLabel',
  'BlockChartRadialShape',
  'BlockChartRadialSimple',
  'BlockChartRadialStacked',
  'BlockChartRadialText',
  'BlockChartTooltipAdvanced',
  'BlockChartTooltipDefault',
  'BlockChartTooltipFormatter',
  'BlockChartTooltipIcons',
  'BlockChartTooltipIndicatorLine',
  'BlockChartTooltipIndicatorNone',
  'BlockChartTooltipLabelCustom',
  'BlockChartTooltipLabelFormatter',
  'BlockChartTooltipLabelNone',
  'BlockDashboard01',
  'BlockDashboardLayout',
  'BlockDashboardSidebar',
  'BlockDemoSidebar',
  'BlockDemoSidebarControlled',
  'BlockDemoSidebarFooter',
  'BlockDemoSidebarGroup',
  'BlockDemoSidebarGroupAction',
  'BlockDemoSidebarGroupCollapsible',
  'BlockDemoSidebarHeader',
  'BlockDemoSidebarMenu',
  'BlockDemoSidebarMenuAction',
  'BlockDemoSidebarMenuBadge',
  'BlockDemoSidebarMenuCollapsible',
  'BlockDemoSidebarMenuSub',
  'BlockDialogsConfirmDelete',
  'BlockFormsValidatedForm',
  'BlockLogin01',
  'BlockLogin02',
  'BlockLogin03',
  'BlockLogin04',
  'BlockLogin05',
  'BlockNewComponents01',
  'BlockOtp01',
  'BlockOtp02',
  'BlockOtp03',
  'BlockOtp04',
  'BlockOtp05',
  'BlockSettingsProfile',
  'BlockSidebar01',
  'BlockSidebar02',
  'BlockSidebar03',
  'BlockSidebar04',
  'BlockSidebar05',
  'BlockSidebar06',
  'BlockTablesUsersTable',
  'ThemeInit',
  'ThemeThemeBrandOcean',
  'ThemeThemeDefault',
  'ThemeThemeSlate',
  'ThemeThemeStone',
  'ThemeThemeZinc',
]
