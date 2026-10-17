import { StyleSheet, Platform, StatusBar } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'web' ? 8 : (Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 12),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: Platform.OS === 'web' ? 4 : 0,
  },
  header: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  subHeader: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  actionNavGroup: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  navButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  searchSection: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  searchLoader: {
    position: 'absolute',
    right: 12,
  },
  gpsButton: {
    backgroundColor: '#0d6efd',
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  resultsContainer: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
  resultText: {
    fontSize: 14,
  },
  loaderContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  trendHeaderCard: {
    marginTop: 12,
    marginBottom: 8,
  },
  trendHeading: {
    fontSize: 18,
    fontWeight: '800',
  },
  trendSubheading: {
    fontSize: 12,
    marginTop: 2,
  },
  rangePillGroup: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    marginTop: 10,
    gap: 4,
  },
  rangePill: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  rangePillActive: {
    backgroundColor: '#0d6efd',
  },
  rangePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6c757d',
  },
  rangePillActiveText: {
    color: '#ffffff',
  },
  tabBar: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    marginVertical: 10,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
