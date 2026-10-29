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
    marginBottom: 14,
    marginTop: Platform.OS === 'web' ? 6 : 0,
  },
  header: {
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  subHeader: {
    fontSize: 12.5,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  actionNavGroup: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  navButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
      },
      default: {
        elevation: 3,
      },
    }),
  },
  navButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
    alignItems: 'stretch',
  },
  searchSection: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    minWidth: 0,
  },
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 18,
    fontSize: 14.5,
    fontWeight: '500',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        outlineStyle: 'none',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
      },
      default: {
        elevation: 2,
      },
    }),
  },
  searchLoader: {
    position: 'absolute',
    right: 16,
  },
  gpsButton: {
    backgroundColor: '#1a73e8', // Google Blue
    paddingHorizontal: 18,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    ...Platform.select({
      web: {
        boxShadow: '0 6px 20px rgba(26, 115, 232, 0.4)',
      },
      default: {
        elevation: 4,
      },
    }),
  },
  gpsButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13.5,
    letterSpacing: 0.3,
  },
  resultsContainer: {
    borderWidth: 1,
    borderRadius: 20,
    marginBottom: 14,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.18)',
      },
      default: {
        elevation: 6,
      },
    }),
  },
  resultItem: {
    padding: 14,
    borderBottomWidth: 1,
  },
  resultText: {
    fontSize: 14.5,
  },
  loaderContainer: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14.5,
    fontWeight: '600',
    color: '#ffffff',
  },
  trendHeaderCard: {
    marginTop: 14,
    marginBottom: 10,
  },
  trendHeading: {
    fontSize: 19,
    fontWeight: '900',
  },
  trendSubheading: {
    fontSize: 12.5,
    marginTop: 2,
  },
  rangePillGroup: {
    flexDirection: 'row',
    padding: 5,
    borderRadius: 24,
    marginTop: 10,
    gap: 4,
  },
  rangePill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 18,
    alignItems: 'center',
  },
  rangePillActive: {
    backgroundColor: '#1a73e8',
  },
  rangePillText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  rangePillActiveText: {
    color: '#ffffff',
  },
  tabBar: {
    flexDirection: 'row',
    padding: 5,
    borderRadius: 24,
    marginVertical: 12,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 18,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  pageStack: {
    width: '100%',
    gap: 8,
    paddingBottom: 18,
  },
  sectionStack: {
    gap: 8,
  },
  toast: {
    position: 'absolute',
    top: 24,
    left: 16,
    right: 16,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    ...Platform.select({
      web: {
        boxShadow: '0 18px 40px rgba(0, 0, 0, 0.28)',
      },
      default: {
        elevation: 8,
      },
    }),
  },
  toastIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastBody: {
    flex: 1,
    minWidth: 0,
  },
  toastTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  toastMessage: {
    color: '#e2e8f0',
    fontSize: 13,
    lineHeight: 18,
  },
  toastLink: {
    marginTop: 6,
    color: '#93c5fd',
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
