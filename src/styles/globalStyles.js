import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 15,
  },
  animatedAlertBanner: {
    position: 'absolute',
    top: 0,
    left: 15,
    right: 15,
    zIndex: 9999,
    padding: 14,
    borderRadius: 12,
    elevation: 8,
  },
  alertHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  alertBody: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  alertDetails: {
    color: '#e0e0e0',
    fontSize: 10,
    marginTop: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subHeader: {
    fontSize: 11,
  },
  actionNavGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 5,
  },
  navButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 11,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchSection: {
    flex: 1,
    position: 'relative',
    marginRight: 8,
  },
  searchInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 13,
  },
  searchLoader: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  gpsButton: {
    backgroundColor: '#0d6efd',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  resultsContainer: {
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    elevation: 3,
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
  },
  resultText: {
    fontSize: 13,
  },
  resultCoords: {
    fontSize: 10,
    marginTop: 2,
  },
  heroCard: {
    backgroundColor: '#0d6efd',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },
  heroTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  heroLocation: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  heroTimeDate: {
    fontSize: 11,
    color: '#cfe2ff',
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#25cff2',
    marginRight: 5,
  },
  liveText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  currentWeatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  tempGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroIcon: {
    fontSize: 38,
    marginRight: 8,
  },
  currentTemp: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  currentMeta: {
    alignItems: 'flex-end',
  },
  weatherDesc: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  metaDetail: {
    fontSize: 11,
    color: '#e0cffc',
    marginTop: 1,
  },
  forecastBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    padding: 10,
    borderRadius: 8,
  },
  forecastTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#9ec5fe',
    marginBottom: 4,
  },
  forecastContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  forecastIcon: {
    fontSize: 22,
    marginRight: 8,
  },
  forecastDetails: {
    flex: 1,
  },
  forecastTemp: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  forecastMeta: {
    fontSize: 10,
    color: '#cfe2ff',
    marginTop: 1,
  },
  trendHeaderCard: {
    marginBottom: 10,
  },
  trendHeading: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  trendSubheading: {
    fontSize: 11,
    marginBottom: 8,
  },
  rangePillGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 3,
    borderRadius: 8,
  },
  rangePill: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
  },
  rangePillActive: {
    backgroundColor: '#0d6efd',
  },
  rangePillText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6c757d',
  },
  rangePillActiveText: {
    color: '#ffffff',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 4,
    borderRadius: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
  },
  loaderContainer: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
  },
  contentContainer: {
    marginBottom: 50,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statBox: {
    flex: 0.31,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 1,
  },
  statLabel: {
    fontSize: 10,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  chartCard: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    elevation: 1,
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginVertical: 6,
    marginLeft: 5,
  },
  chartStyle: {
    marginVertical: 4,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  locationDetailText: {
    fontSize: 12,
  },
  pickerGroup: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  pickerOption: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  pickerText: {
    fontSize: 11,
    color: '#495057',
  },
  pickerTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  checkboxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  checkboxLabel: {
    fontSize: 13,
  },
  notifyDropdownContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  colorSwatchRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  colorSwatchActive: {
    borderWidth: 3,
    borderColor: '#ffffff',
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  unitToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#e9ecef',
    borderRadius: 6,
    padding: 2,
  },
  unitOption: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  unitActive: {
    backgroundColor: '#0d6efd',
  },
  unitText: {
    fontSize: 12,
    color: '#495057',
  },
  unitActiveText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  exportButton: {
    backgroundColor: '#198754',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  exportButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  aboutText: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 14,
  },
});
    
