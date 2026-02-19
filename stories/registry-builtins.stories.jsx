/** @jsxImportSource fict */

import { renderRegistryEntryPreview } from './registry-runtime-preview'

import * as BlockModuleAuthLoginForm from './generated/runtime/src/components/blocks/auth/login-form.tsx'
import * as BlockModuleAuthSignupForm from './generated/runtime/src/components/blocks/auth/signup-form.tsx'
import * as BlockModuleCalendar01 from './generated/runtime/src/components/blocks/calendar-01.tsx'
import * as BlockModuleCalendar02 from './generated/runtime/src/components/blocks/calendar-02.tsx'
import * as BlockModuleCalendar03 from './generated/runtime/src/components/blocks/calendar-03.tsx'
import * as BlockModuleCalendar04 from './generated/runtime/src/components/blocks/calendar-04.tsx'
import * as BlockModuleCalendar05 from './generated/runtime/src/components/blocks/calendar-05.tsx'
import * as BlockModuleCalendar06 from './generated/runtime/src/components/blocks/calendar-06.tsx'
import * as BlockModuleCalendar07 from './generated/runtime/src/components/blocks/calendar-07.tsx'
import * as BlockModuleCalendar08 from './generated/runtime/src/components/blocks/calendar-08.tsx'
import * as BlockModuleCalendar09 from './generated/runtime/src/components/blocks/calendar-09.tsx'
import * as BlockModuleCalendar10 from './generated/runtime/src/components/blocks/calendar-10.tsx'
import * as BlockModuleCalendar11 from './generated/runtime/src/components/blocks/calendar-11.tsx'
import * as BlockModuleCalendar12 from './generated/runtime/src/components/blocks/calendar-12.tsx'
import * as BlockModuleCalendar13 from './generated/runtime/src/components/blocks/calendar-13.tsx'
import * as BlockModuleCalendar14 from './generated/runtime/src/components/blocks/calendar-14.tsx'
import * as BlockModuleCalendar15 from './generated/runtime/src/components/blocks/calendar-15.tsx'
import * as BlockModuleCalendar16 from './generated/runtime/src/components/blocks/calendar-16.tsx'
import * as BlockModuleCalendar17 from './generated/runtime/src/components/blocks/calendar-17.tsx'
import * as BlockModuleCalendar18 from './generated/runtime/src/components/blocks/calendar-18.tsx'
import * as BlockModuleCalendar19 from './generated/runtime/src/components/blocks/calendar-19.tsx'
import * as BlockModuleCalendar20 from './generated/runtime/src/components/blocks/calendar-20.tsx'
import * as BlockModuleCalendar21 from './generated/runtime/src/components/blocks/calendar-21.tsx'
import * as BlockModuleCalendar22 from './generated/runtime/src/components/blocks/calendar-22.tsx'
import * as BlockModuleCalendar23 from './generated/runtime/src/components/blocks/calendar-23.tsx'
import * as BlockModuleCalendar24 from './generated/runtime/src/components/blocks/calendar-24.tsx'
import * as BlockModuleCalendar25 from './generated/runtime/src/components/blocks/calendar-25.tsx'
import * as BlockModuleCalendar26 from './generated/runtime/src/components/blocks/calendar-26.tsx'
import * as BlockModuleCalendar27 from './generated/runtime/src/components/blocks/calendar-27.tsx'
import * as BlockModuleCalendar28 from './generated/runtime/src/components/blocks/calendar-28.tsx'
import * as BlockModuleCalendar29 from './generated/runtime/src/components/blocks/calendar-29.tsx'
import * as BlockModuleCalendar30 from './generated/runtime/src/components/blocks/calendar-30.tsx'
import * as BlockModuleCalendar31 from './generated/runtime/src/components/blocks/calendar-31.tsx'
import * as BlockModuleCalendar32 from './generated/runtime/src/components/blocks/calendar-32.tsx'
import * as BlockModuleChartAreaAxes from './generated/runtime/src/components/blocks/chart-area-axes.tsx'
import * as BlockModuleChartAreaDefault from './generated/runtime/src/components/blocks/chart-area-default.tsx'
import * as BlockModuleChartAreaGradient from './generated/runtime/src/components/blocks/chart-area-gradient.tsx'
import * as BlockModuleChartAreaIcons from './generated/runtime/src/components/blocks/chart-area-icons.tsx'
import * as BlockModuleChartAreaInteractive from './generated/runtime/src/components/blocks/chart-area-interactive.tsx'
import * as BlockModuleChartAreaLegend from './generated/runtime/src/components/blocks/chart-area-legend.tsx'
import * as BlockModuleChartAreaLinear from './generated/runtime/src/components/blocks/chart-area-linear.tsx'
import * as BlockModuleChartAreaStacked from './generated/runtime/src/components/blocks/chart-area-stacked.tsx'
import * as BlockModuleChartAreaStackedExpand from './generated/runtime/src/components/blocks/chart-area-stacked-expand.tsx'
import * as BlockModuleChartAreaStep from './generated/runtime/src/components/blocks/chart-area-step.tsx'
import * as BlockModuleChartBarActive from './generated/runtime/src/components/blocks/chart-bar-active.tsx'
import * as BlockModuleChartBarDefault from './generated/runtime/src/components/blocks/chart-bar-default.tsx'
import * as BlockModuleChartBarHorizontal from './generated/runtime/src/components/blocks/chart-bar-horizontal.tsx'
import * as BlockModuleChartBarInteractive from './generated/runtime/src/components/blocks/chart-bar-interactive.tsx'
import * as BlockModuleChartBarLabel from './generated/runtime/src/components/blocks/chart-bar-label.tsx'
import * as BlockModuleChartBarLabelCustom from './generated/runtime/src/components/blocks/chart-bar-label-custom.tsx'
import * as BlockModuleChartBarMixed from './generated/runtime/src/components/blocks/chart-bar-mixed.tsx'
import * as BlockModuleChartBarMultiple from './generated/runtime/src/components/blocks/chart-bar-multiple.tsx'
import * as BlockModuleChartBarNegative from './generated/runtime/src/components/blocks/chart-bar-negative.tsx'
import * as BlockModuleChartBarStacked from './generated/runtime/src/components/blocks/chart-bar-stacked.tsx'
import * as BlockModuleChartLineDefault from './generated/runtime/src/components/blocks/chart-line-default.tsx'
import * as BlockModuleChartLineDots from './generated/runtime/src/components/blocks/chart-line-dots.tsx'
import * as BlockModuleChartLineDotsColors from './generated/runtime/src/components/blocks/chart-line-dots-colors.tsx'
import * as BlockModuleChartLineDotsCustom from './generated/runtime/src/components/blocks/chart-line-dots-custom.tsx'
import * as BlockModuleChartLineInteractive from './generated/runtime/src/components/blocks/chart-line-interactive.tsx'
import * as BlockModuleChartLineLabel from './generated/runtime/src/components/blocks/chart-line-label.tsx'
import * as BlockModuleChartLineLabelCustom from './generated/runtime/src/components/blocks/chart-line-label-custom.tsx'
import * as BlockModuleChartLineLinear from './generated/runtime/src/components/blocks/chart-line-linear.tsx'
import * as BlockModuleChartLineMultiple from './generated/runtime/src/components/blocks/chart-line-multiple.tsx'
import * as BlockModuleChartLineStep from './generated/runtime/src/components/blocks/chart-line-step.tsx'
import * as BlockModuleChartPieDonut from './generated/runtime/src/components/blocks/chart-pie-donut.tsx'
import * as BlockModuleChartPieDonutActive from './generated/runtime/src/components/blocks/chart-pie-donut-active.tsx'
import * as BlockModuleChartPieDonutText from './generated/runtime/src/components/blocks/chart-pie-donut-text.tsx'
import * as BlockModuleChartPieInteractive from './generated/runtime/src/components/blocks/chart-pie-interactive.tsx'
import * as BlockModuleChartPieLabel from './generated/runtime/src/components/blocks/chart-pie-label.tsx'
import * as BlockModuleChartPieLabelCustom from './generated/runtime/src/components/blocks/chart-pie-label-custom.tsx'
import * as BlockModuleChartPieLabelList from './generated/runtime/src/components/blocks/chart-pie-label-list.tsx'
import * as BlockModuleChartPieLegend from './generated/runtime/src/components/blocks/chart-pie-legend.tsx'
import * as BlockModuleChartPieSeparatorNone from './generated/runtime/src/components/blocks/chart-pie-separator-none.tsx'
import * as BlockModuleChartPieSimple from './generated/runtime/src/components/blocks/chart-pie-simple.tsx'
import * as BlockModuleChartPieStacked from './generated/runtime/src/components/blocks/chart-pie-stacked.tsx'
import * as BlockModuleChartRadarDefault from './generated/runtime/src/components/blocks/chart-radar-default.tsx'
import * as BlockModuleChartRadarDots from './generated/runtime/src/components/blocks/chart-radar-dots.tsx'
import * as BlockModuleChartRadarGridCircle from './generated/runtime/src/components/blocks/chart-radar-grid-circle.tsx'
import * as BlockModuleChartRadarGridCircleFill from './generated/runtime/src/components/blocks/chart-radar-grid-circle-fill.tsx'
import * as BlockModuleChartRadarGridCircleNoLines from './generated/runtime/src/components/blocks/chart-radar-grid-circle-no-lines.tsx'
import * as BlockModuleChartRadarGridCustom from './generated/runtime/src/components/blocks/chart-radar-grid-custom.tsx'
import * as BlockModuleChartRadarGridFill from './generated/runtime/src/components/blocks/chart-radar-grid-fill.tsx'
import * as BlockModuleChartRadarGridNone from './generated/runtime/src/components/blocks/chart-radar-grid-none.tsx'
import * as BlockModuleChartRadarIcons from './generated/runtime/src/components/blocks/chart-radar-icons.tsx'
import * as BlockModuleChartRadarLabelCustom from './generated/runtime/src/components/blocks/chart-radar-label-custom.tsx'
import * as BlockModuleChartRadarLegend from './generated/runtime/src/components/blocks/chart-radar-legend.tsx'
import * as BlockModuleChartRadarLinesOnly from './generated/runtime/src/components/blocks/chart-radar-lines-only.tsx'
import * as BlockModuleChartRadarMultiple from './generated/runtime/src/components/blocks/chart-radar-multiple.tsx'
import * as BlockModuleChartRadarRadius from './generated/runtime/src/components/blocks/chart-radar-radius.tsx'
import * as BlockModuleChartRadialGrid from './generated/runtime/src/components/blocks/chart-radial-grid.tsx'
import * as BlockModuleChartRadialLabel from './generated/runtime/src/components/blocks/chart-radial-label.tsx'
import * as BlockModuleChartRadialShape from './generated/runtime/src/components/blocks/chart-radial-shape.tsx'
import * as BlockModuleChartRadialSimple from './generated/runtime/src/components/blocks/chart-radial-simple.tsx'
import * as BlockModuleChartRadialStacked from './generated/runtime/src/components/blocks/chart-radial-stacked.tsx'
import * as BlockModuleChartRadialText from './generated/runtime/src/components/blocks/chart-radial-text.tsx'
import * as BlockModuleChartTooltipAdvanced from './generated/runtime/src/components/blocks/chart-tooltip-advanced.tsx'
import * as BlockModuleChartTooltipDefault from './generated/runtime/src/components/blocks/chart-tooltip-default.tsx'
import * as BlockModuleChartTooltipFormatter from './generated/runtime/src/components/blocks/chart-tooltip-formatter.tsx'
import * as BlockModuleChartTooltipIcons from './generated/runtime/src/components/blocks/chart-tooltip-icons.tsx'
import * as BlockModuleChartTooltipIndicatorLine from './generated/runtime/src/components/blocks/chart-tooltip-indicator-line.tsx'
import * as BlockModuleChartTooltipIndicatorNone from './generated/runtime/src/components/blocks/chart-tooltip-indicator-none.tsx'
import * as BlockModuleChartTooltipLabelCustom from './generated/runtime/src/components/blocks/chart-tooltip-label-custom.tsx'
import * as BlockModuleChartTooltipLabelFormatter from './generated/runtime/src/components/blocks/chart-tooltip-label-formatter.tsx'
import * as BlockModuleChartTooltipLabelNone from './generated/runtime/src/components/blocks/chart-tooltip-label-none.tsx'
import * as BlockModuleDashboard01 from './generated/runtime/src/components/blocks/dashboard-01.tsx'
import * as BlockModuleDashboardLayout from './generated/runtime/src/components/blocks/dashboard/layout.tsx'
import * as BlockModuleDashboardSidebar from './generated/runtime/src/components/blocks/dashboard/sidebar.tsx'
import * as BlockModuleDemoSidebar from './generated/runtime/src/components/blocks/demo-sidebar.tsx'
import * as BlockModuleDemoSidebarControlled from './generated/runtime/src/components/blocks/demo-sidebar-controlled.tsx'
import * as BlockModuleDemoSidebarFooter from './generated/runtime/src/components/blocks/demo-sidebar-footer.tsx'
import * as BlockModuleDemoSidebarGroup from './generated/runtime/src/components/blocks/demo-sidebar-group.tsx'
import * as BlockModuleDemoSidebarGroupAction from './generated/runtime/src/components/blocks/demo-sidebar-group-action.tsx'
import * as BlockModuleDemoSidebarGroupCollapsible from './generated/runtime/src/components/blocks/demo-sidebar-group-collapsible.tsx'
import * as BlockModuleDemoSidebarHeader from './generated/runtime/src/components/blocks/demo-sidebar-header.tsx'
import * as BlockModuleDemoSidebarMenu from './generated/runtime/src/components/blocks/demo-sidebar-menu.tsx'
import * as BlockModuleDemoSidebarMenuAction from './generated/runtime/src/components/blocks/demo-sidebar-menu-action.tsx'
import * as BlockModuleDemoSidebarMenuBadge from './generated/runtime/src/components/blocks/demo-sidebar-menu-badge.tsx'
import * as BlockModuleDemoSidebarMenuCollapsible from './generated/runtime/src/components/blocks/demo-sidebar-menu-collapsible.tsx'
import * as BlockModuleDemoSidebarMenuSub from './generated/runtime/src/components/blocks/demo-sidebar-menu-sub.tsx'
import * as BlockModuleDialogsConfirmDelete from './generated/runtime/src/components/blocks/dialogs/confirm-delete.tsx'
import * as BlockModuleFormsValidatedForm from './generated/runtime/src/components/blocks/forms/validated-form.tsx'
import * as BlockModuleLogin01 from './generated/runtime/src/components/blocks/login-01.tsx'
import * as BlockModuleLogin02 from './generated/runtime/src/components/blocks/login-02.tsx'
import * as BlockModuleLogin03 from './generated/runtime/src/components/blocks/login-03.tsx'
import * as BlockModuleLogin04 from './generated/runtime/src/components/blocks/login-04.tsx'
import * as BlockModuleLogin05 from './generated/runtime/src/components/blocks/login-05.tsx'
import * as BlockModuleNewComponents01 from './generated/runtime/src/components/blocks/new-components-01.tsx'
import * as BlockModuleOtp01 from './generated/runtime/src/components/blocks/otp-01.tsx'
import * as BlockModuleOtp02 from './generated/runtime/src/components/blocks/otp-02.tsx'
import * as BlockModuleOtp03 from './generated/runtime/src/components/blocks/otp-03.tsx'
import * as BlockModuleOtp04 from './generated/runtime/src/components/blocks/otp-04.tsx'
import * as BlockModuleOtp05 from './generated/runtime/src/components/blocks/otp-05.tsx'
import * as BlockModuleSettingsProfile from './generated/runtime/src/components/blocks/settings/profile.tsx'
import * as BlockModuleSidebar01 from './generated/runtime/src/components/blocks/sidebar-01.tsx'
import * as BlockModuleSidebar02 from './generated/runtime/src/components/blocks/sidebar-02.tsx'
import * as BlockModuleSidebar03 from './generated/runtime/src/components/blocks/sidebar-03.tsx'
import * as BlockModuleSidebar04 from './generated/runtime/src/components/blocks/sidebar-04.tsx'
import * as BlockModuleSidebar05 from './generated/runtime/src/components/blocks/sidebar-05.tsx'
import * as BlockModuleSidebar06 from './generated/runtime/src/components/blocks/sidebar-06.tsx'
import * as BlockModuleTablesUsersTable from './generated/runtime/src/components/blocks/tables/users-table.tsx'
import * as ComponentModuleAccordion from './generated/runtime/src/components/ui/accordion.tsx'
import * as ComponentModuleAlert from './generated/runtime/src/components/ui/alert.tsx'
import * as ComponentModuleAlertDialog from './generated/runtime/src/components/ui/alert-dialog.tsx'
import * as ComponentModuleAspectRatio from './generated/runtime/src/components/ui/aspect-ratio.tsx'
import * as ComponentModuleAvatar from './generated/runtime/src/components/ui/avatar.tsx'
import * as ComponentModuleBadge from './generated/runtime/src/components/ui/badge.tsx'
import * as ComponentModuleBreadcrumb from './generated/runtime/src/components/ui/breadcrumb.tsx'
import * as ComponentModuleButton from './generated/runtime/src/components/ui/button.tsx'
import * as ComponentModuleButtonGroup from './generated/runtime/src/components/ui/button-group.tsx'
import * as ComponentModuleCalendar from './generated/runtime/src/components/ui/calendar.tsx'
import * as ComponentModuleCard from './generated/runtime/src/components/ui/card.tsx'
import * as ComponentModuleCarousel from './generated/runtime/src/components/ui/carousel.tsx'
import * as ComponentModuleChart from './generated/runtime/src/components/ui/chart.tsx'
import * as ComponentModuleCheckbox from './generated/runtime/src/components/ui/checkbox.tsx'
import * as ComponentModuleCollapsible from './generated/runtime/src/components/ui/collapsible.tsx'
import * as ComponentModuleCombobox from './generated/runtime/src/components/ui/combobox.tsx'
import * as ComponentModuleCommand from './generated/runtime/src/components/ui/command.tsx'
import * as ComponentModuleContextMenu from './generated/runtime/src/components/ui/context-menu.tsx'
import * as ComponentModuleDataTable from './generated/runtime/src/components/ui/data-table.tsx'
import * as ComponentModuleDialog from './generated/runtime/src/components/ui/dialog.tsx'
import * as ComponentModuleDrawer from './generated/runtime/src/components/ui/drawer.tsx'
import * as ComponentModuleDropdownMenu from './generated/runtime/src/components/ui/dropdown-menu.tsx'
import * as ComponentModuleEmpty from './generated/runtime/src/components/ui/empty.tsx'
import * as ComponentModuleField from './generated/runtime/src/components/ui/field.tsx'
import * as ComponentModuleForm from './generated/runtime/src/components/ui/form.tsx'
import * as ComponentModuleHoverCard from './generated/runtime/src/components/ui/hover-card.tsx'
import * as ComponentModuleInput from './generated/runtime/src/components/ui/input.tsx'
import * as ComponentModuleInputGroup from './generated/runtime/src/components/ui/input-group.tsx'
import * as ComponentModuleInputOtp from './generated/runtime/src/components/ui/input-otp.tsx'
import * as ComponentModuleIsMobile from './generated/runtime/src/lib/hooks/is-mobile.ts'
import * as ComponentModuleItem from './generated/runtime/src/components/ui/item.tsx'
import * as ComponentModuleKbd from './generated/runtime/src/components/ui/kbd.tsx'
import * as ComponentModuleLabel from './generated/runtime/src/components/ui/label.tsx'
import * as ComponentModuleMenubar from './generated/runtime/src/components/ui/menubar.tsx'
import * as ComponentModuleNativeSelect from './generated/runtime/src/components/ui/native-select.tsx'
import * as ComponentModuleNavigationMenu from './generated/runtime/src/components/ui/navigation-menu.tsx'
import * as ComponentModulePagination from './generated/runtime/src/components/ui/pagination.tsx'
import * as ComponentModulePopover from './generated/runtime/src/components/ui/popover.tsx'
import * as ComponentModuleProgress from './generated/runtime/src/components/ui/progress.tsx'
import * as ComponentModuleRadioGroup from './generated/runtime/src/components/ui/radio-group.tsx'
import * as ComponentModuleRangeCalendar from './generated/runtime/src/components/ui/range-calendar.tsx'
import * as ComponentModuleResizable from './generated/runtime/src/components/ui/resizable.tsx'
import * as ComponentModuleScrollArea from './generated/runtime/src/components/ui/scroll-area.tsx'
import * as ComponentModuleSelect from './generated/runtime/src/components/ui/select.tsx'
import * as ComponentModuleSeparator from './generated/runtime/src/components/ui/separator.tsx'
import * as ComponentModuleSheet from './generated/runtime/src/components/ui/sheet.tsx'
import * as ComponentModuleSidebar from './generated/runtime/src/components/ui/sidebar.tsx'
import * as ComponentModuleSkeleton from './generated/runtime/src/components/ui/skeleton.tsx'
import * as ComponentModuleSlider from './generated/runtime/src/components/ui/slider.tsx'
import * as ComponentModuleSonner from './generated/runtime/src/components/ui/sonner.tsx'
import * as ComponentModuleSpinner from './generated/runtime/src/components/ui/spinner.tsx'
import * as ComponentModuleSwitch from './generated/runtime/src/components/ui/switch.tsx'
import * as ComponentModuleTable from './generated/runtime/src/components/ui/table.tsx'
import * as ComponentModuleTabs from './generated/runtime/src/components/ui/tabs.tsx'
import * as ComponentModuleTextarea from './generated/runtime/src/components/ui/textarea.tsx'
import * as ComponentModuleToast from './generated/runtime/src/components/ui/toast.tsx'
import * as ComponentModuleToggle from './generated/runtime/src/components/ui/toggle.tsx'
import * as ComponentModuleToggleGroup from './generated/runtime/src/components/ui/toggle-group.tsx'
import * as ComponentModuleTooltip from './generated/runtime/src/components/ui/tooltip.tsx'
import * as ComponentModuleUtils from './generated/runtime/src/lib/utils.ts'

import './generated/runtime/src/styles/themes/init.css'
import './generated/runtime/src/styles/themes/theme-brand-ocean.css'
import './generated/runtime/src/styles/themes/theme-default.css'
import './generated/runtime/src/styles/themes/theme-slate.css'
import './generated/runtime/src/styles/themes/theme-stone.css'
import './generated/runtime/src/styles/themes/theme-zinc.css'

const liveModules = {
  component: {
    'accordion': ComponentModuleAccordion,
    'alert-dialog': ComponentModuleAlertDialog,
    'alert': ComponentModuleAlert,
    'aspect-ratio': ComponentModuleAspectRatio,
    'avatar': ComponentModuleAvatar,
    'badge': ComponentModuleBadge,
    'breadcrumb': ComponentModuleBreadcrumb,
    'button-group': ComponentModuleButtonGroup,
    'button': ComponentModuleButton,
    'calendar': ComponentModuleCalendar,
    'card': ComponentModuleCard,
    'carousel': ComponentModuleCarousel,
    'chart': ComponentModuleChart,
    'checkbox': ComponentModuleCheckbox,
    'collapsible': ComponentModuleCollapsible,
    'combobox': ComponentModuleCombobox,
    'command': ComponentModuleCommand,
    'context-menu': ComponentModuleContextMenu,
    'data-table': ComponentModuleDataTable,
    'dialog': ComponentModuleDialog,
    'drawer': ComponentModuleDrawer,
    'dropdown-menu': ComponentModuleDropdownMenu,
    'empty': ComponentModuleEmpty,
    'field': ComponentModuleField,
    'form': ComponentModuleForm,
    'hover-card': ComponentModuleHoverCard,
    'input-group': ComponentModuleInputGroup,
    'input-otp': ComponentModuleInputOtp,
    'input': ComponentModuleInput,
    'is-mobile': ComponentModuleIsMobile,
    'item': ComponentModuleItem,
    'kbd': ComponentModuleKbd,
    'label': ComponentModuleLabel,
    'menubar': ComponentModuleMenubar,
    'native-select': ComponentModuleNativeSelect,
    'navigation-menu': ComponentModuleNavigationMenu,
    'pagination': ComponentModulePagination,
    'popover': ComponentModulePopover,
    'progress': ComponentModuleProgress,
    'radio-group': ComponentModuleRadioGroup,
    'range-calendar': ComponentModuleRangeCalendar,
    'resizable': ComponentModuleResizable,
    'scroll-area': ComponentModuleScrollArea,
    'select': ComponentModuleSelect,
    'separator': ComponentModuleSeparator,
    'sheet': ComponentModuleSheet,
    'sidebar': ComponentModuleSidebar,
    'skeleton': ComponentModuleSkeleton,
    'slider': ComponentModuleSlider,
    'sonner': ComponentModuleSonner,
    'spinner': ComponentModuleSpinner,
    'switch': ComponentModuleSwitch,
    'table': ComponentModuleTable,
    'tabs': ComponentModuleTabs,
    'textarea': ComponentModuleTextarea,
    'toast': ComponentModuleToast,
    'toggle-group': ComponentModuleToggleGroup,
    'toggle': ComponentModuleToggle,
    'tooltip': ComponentModuleTooltip,
    'utils': ComponentModuleUtils,
  },
  block: {
    'auth/login-form': BlockModuleAuthLoginForm,
    'auth/signup-form': BlockModuleAuthSignupForm,
    'calendar-01': BlockModuleCalendar01,
    'calendar-02': BlockModuleCalendar02,
    'calendar-03': BlockModuleCalendar03,
    'calendar-04': BlockModuleCalendar04,
    'calendar-05': BlockModuleCalendar05,
    'calendar-06': BlockModuleCalendar06,
    'calendar-07': BlockModuleCalendar07,
    'calendar-08': BlockModuleCalendar08,
    'calendar-09': BlockModuleCalendar09,
    'calendar-10': BlockModuleCalendar10,
    'calendar-11': BlockModuleCalendar11,
    'calendar-12': BlockModuleCalendar12,
    'calendar-13': BlockModuleCalendar13,
    'calendar-14': BlockModuleCalendar14,
    'calendar-15': BlockModuleCalendar15,
    'calendar-16': BlockModuleCalendar16,
    'calendar-17': BlockModuleCalendar17,
    'calendar-18': BlockModuleCalendar18,
    'calendar-19': BlockModuleCalendar19,
    'calendar-20': BlockModuleCalendar20,
    'calendar-21': BlockModuleCalendar21,
    'calendar-22': BlockModuleCalendar22,
    'calendar-23': BlockModuleCalendar23,
    'calendar-24': BlockModuleCalendar24,
    'calendar-25': BlockModuleCalendar25,
    'calendar-26': BlockModuleCalendar26,
    'calendar-27': BlockModuleCalendar27,
    'calendar-28': BlockModuleCalendar28,
    'calendar-29': BlockModuleCalendar29,
    'calendar-30': BlockModuleCalendar30,
    'calendar-31': BlockModuleCalendar31,
    'calendar-32': BlockModuleCalendar32,
    'chart-area-axes': BlockModuleChartAreaAxes,
    'chart-area-default': BlockModuleChartAreaDefault,
    'chart-area-gradient': BlockModuleChartAreaGradient,
    'chart-area-icons': BlockModuleChartAreaIcons,
    'chart-area-interactive': BlockModuleChartAreaInteractive,
    'chart-area-legend': BlockModuleChartAreaLegend,
    'chart-area-linear': BlockModuleChartAreaLinear,
    'chart-area-stacked-expand': BlockModuleChartAreaStackedExpand,
    'chart-area-stacked': BlockModuleChartAreaStacked,
    'chart-area-step': BlockModuleChartAreaStep,
    'chart-bar-active': BlockModuleChartBarActive,
    'chart-bar-default': BlockModuleChartBarDefault,
    'chart-bar-horizontal': BlockModuleChartBarHorizontal,
    'chart-bar-interactive': BlockModuleChartBarInteractive,
    'chart-bar-label-custom': BlockModuleChartBarLabelCustom,
    'chart-bar-label': BlockModuleChartBarLabel,
    'chart-bar-mixed': BlockModuleChartBarMixed,
    'chart-bar-multiple': BlockModuleChartBarMultiple,
    'chart-bar-negative': BlockModuleChartBarNegative,
    'chart-bar-stacked': BlockModuleChartBarStacked,
    'chart-line-default': BlockModuleChartLineDefault,
    'chart-line-dots-colors': BlockModuleChartLineDotsColors,
    'chart-line-dots-custom': BlockModuleChartLineDotsCustom,
    'chart-line-dots': BlockModuleChartLineDots,
    'chart-line-interactive': BlockModuleChartLineInteractive,
    'chart-line-label-custom': BlockModuleChartLineLabelCustom,
    'chart-line-label': BlockModuleChartLineLabel,
    'chart-line-linear': BlockModuleChartLineLinear,
    'chart-line-multiple': BlockModuleChartLineMultiple,
    'chart-line-step': BlockModuleChartLineStep,
    'chart-pie-donut-active': BlockModuleChartPieDonutActive,
    'chart-pie-donut-text': BlockModuleChartPieDonutText,
    'chart-pie-donut': BlockModuleChartPieDonut,
    'chart-pie-interactive': BlockModuleChartPieInteractive,
    'chart-pie-label-custom': BlockModuleChartPieLabelCustom,
    'chart-pie-label-list': BlockModuleChartPieLabelList,
    'chart-pie-label': BlockModuleChartPieLabel,
    'chart-pie-legend': BlockModuleChartPieLegend,
    'chart-pie-separator-none': BlockModuleChartPieSeparatorNone,
    'chart-pie-simple': BlockModuleChartPieSimple,
    'chart-pie-stacked': BlockModuleChartPieStacked,
    'chart-radar-default': BlockModuleChartRadarDefault,
    'chart-radar-dots': BlockModuleChartRadarDots,
    'chart-radar-grid-circle-fill': BlockModuleChartRadarGridCircleFill,
    'chart-radar-grid-circle-no-lines': BlockModuleChartRadarGridCircleNoLines,
    'chart-radar-grid-circle': BlockModuleChartRadarGridCircle,
    'chart-radar-grid-custom': BlockModuleChartRadarGridCustom,
    'chart-radar-grid-fill': BlockModuleChartRadarGridFill,
    'chart-radar-grid-none': BlockModuleChartRadarGridNone,
    'chart-radar-icons': BlockModuleChartRadarIcons,
    'chart-radar-label-custom': BlockModuleChartRadarLabelCustom,
    'chart-radar-legend': BlockModuleChartRadarLegend,
    'chart-radar-lines-only': BlockModuleChartRadarLinesOnly,
    'chart-radar-multiple': BlockModuleChartRadarMultiple,
    'chart-radar-radius': BlockModuleChartRadarRadius,
    'chart-radial-grid': BlockModuleChartRadialGrid,
    'chart-radial-label': BlockModuleChartRadialLabel,
    'chart-radial-shape': BlockModuleChartRadialShape,
    'chart-radial-simple': BlockModuleChartRadialSimple,
    'chart-radial-stacked': BlockModuleChartRadialStacked,
    'chart-radial-text': BlockModuleChartRadialText,
    'chart-tooltip-advanced': BlockModuleChartTooltipAdvanced,
    'chart-tooltip-default': BlockModuleChartTooltipDefault,
    'chart-tooltip-formatter': BlockModuleChartTooltipFormatter,
    'chart-tooltip-icons': BlockModuleChartTooltipIcons,
    'chart-tooltip-indicator-line': BlockModuleChartTooltipIndicatorLine,
    'chart-tooltip-indicator-none': BlockModuleChartTooltipIndicatorNone,
    'chart-tooltip-label-custom': BlockModuleChartTooltipLabelCustom,
    'chart-tooltip-label-formatter': BlockModuleChartTooltipLabelFormatter,
    'chart-tooltip-label-none': BlockModuleChartTooltipLabelNone,
    'dashboard-01': BlockModuleDashboard01,
    'dashboard/layout': BlockModuleDashboardLayout,
    'dashboard/sidebar': BlockModuleDashboardSidebar,
    'demo-sidebar-controlled': BlockModuleDemoSidebarControlled,
    'demo-sidebar-footer': BlockModuleDemoSidebarFooter,
    'demo-sidebar-group-action': BlockModuleDemoSidebarGroupAction,
    'demo-sidebar-group-collapsible': BlockModuleDemoSidebarGroupCollapsible,
    'demo-sidebar-group': BlockModuleDemoSidebarGroup,
    'demo-sidebar-header': BlockModuleDemoSidebarHeader,
    'demo-sidebar-menu-action': BlockModuleDemoSidebarMenuAction,
    'demo-sidebar-menu-badge': BlockModuleDemoSidebarMenuBadge,
    'demo-sidebar-menu-collapsible': BlockModuleDemoSidebarMenuCollapsible,
    'demo-sidebar-menu-sub': BlockModuleDemoSidebarMenuSub,
    'demo-sidebar-menu': BlockModuleDemoSidebarMenu,
    'demo-sidebar': BlockModuleDemoSidebar,
    'dialogs/confirm-delete': BlockModuleDialogsConfirmDelete,
    'forms/validated-form': BlockModuleFormsValidatedForm,
    'login-01': BlockModuleLogin01,
    'login-02': BlockModuleLogin02,
    'login-03': BlockModuleLogin03,
    'login-04': BlockModuleLogin04,
    'login-05': BlockModuleLogin05,
    'new-components-01': BlockModuleNewComponents01,
    'otp-01': BlockModuleOtp01,
    'otp-02': BlockModuleOtp02,
    'otp-03': BlockModuleOtp03,
    'otp-04': BlockModuleOtp04,
    'otp-05': BlockModuleOtp05,
    'settings/profile': BlockModuleSettingsProfile,
    'sidebar-01': BlockModuleSidebar01,
    'sidebar-02': BlockModuleSidebar02,
    'sidebar-03': BlockModuleSidebar03,
    'sidebar-04': BlockModuleSidebar04,
    'sidebar-05': BlockModuleSidebar05,
    'sidebar-06': BlockModuleSidebar06,
    'tables/users-table': BlockModuleTablesUsersTable,
  },
}

const meta = {
  title: 'Fict Shadcn/Builtin Registry',
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

function createRegistryStory(kind, name) {
  return {
    name: kind + '/' + name,
    render: () => renderRegistryEntryPreview(kind, name, liveModules),
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
