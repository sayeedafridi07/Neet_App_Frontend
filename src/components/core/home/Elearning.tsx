import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ElearningHomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingTitle}>Namaste, Sayeed 👋</Text>
            <Text style={styles.greetingSub}>
              Let's crack those mock tests today.
            </Text>
          </View>
          <Image
            source={{
              uri: "https://ui-avatars.com/api/?name=Sayeed+Afridi&background=00704A&color=fff",
            }}
            style={styles.profileAvatar}
          />
        </View>

        {/* Audio Lectures - Spotify Style */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Study Podcasts</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {[
              "Physics - Wave Optics",
              "History - Modern India",
              "Organic Chem: Aldehydes",
            ].map((item, index) => (
              <TouchableOpacity key={index} style={styles.audioCard}>
                <View style={styles.audioPlaceholder}>
                  {/* Placeholder for Subject Art */}
                  <Text style={styles.audioSubjectText}>
                    {item.split(" - ")[0]}
                  </Text>
                </View>
                <Text style={styles.audioTitle} numberOfLines={1}>
                  {item}
                </Text>
                <Text style={styles.audioSubtext}>45 mins • Dr. Sharma</Text>
                {/* Play Button Icon */}
                <View style={styles.playButton}>
                  <Text style={styles.playIcon}>▶</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Keyword Revision - Starbucks Reward Style */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Targets</Text>
          <View style={styles.revisionCard}>
            <View style={styles.revisionHeader}>
              <Text style={styles.revisionTitle}>Keyword Flashcards</Text>
              <Text style={styles.revisionBadge}>Streak: 4 Days 🔥</Text>
            </View>
            <Text style={styles.revisionBody}>
              You have 25 high-yield keywords pending for biology today.
            </Text>

            <View style={styles.progressBarBackground}>
              <View style={styles.progressBarFill} />
            </View>
            <Text style={styles.progressText}>15 / 40 Mastered</Text>

            <TouchableOpacity style={styles.reviseButton}>
              <Text style={styles.reviseButtonText}>Revise Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* MCQ Practice - Grid Style */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Your Mettle</Text>
          <View style={styles.mcqGrid}>
            {[
              { title: "Chapter Wise", icon: "📝" },
              { title: "PYQs (2015-23)", icon: "🕰️" },
              { title: "All-India Mock", icon: "🏆" },
              { title: "Weak Topics", icon: "🎯" },
            ].map((btn, index) => (
              <TouchableOpacity key={index} style={styles.mcqButton}>
                <Text style={styles.mcqIcon}>{btn.icon}</Text>
                <Text style={styles.mcqButtonText}>{btn.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", // Spotify Dark
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    marginTop: 10,
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  greetingSub: {
    fontSize: 14,
    color: "#B3B3B3", // Spotify subtle grey
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#00704A", // Starbucks Green accent
  },
  section: {
    marginBottom: 35,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  horizontalScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  audioCard: {
    width: 150,
    marginRight: 16,
  },
  audioPlaceholder: {
    width: 150,
    height: 150,
    backgroundColor: "#282828",
    borderRadius: 8,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  audioSubjectText: {
    color: "#535353",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
  audioTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  audioSubtext: {
    color: "#B3B3B3",
    fontSize: 12,
  },
  playButton: {
    position: "absolute",
    bottom: 50,
    right: 8,
    width: 40,
    height: 40,
    backgroundColor: "#1ED760", // Spotify vibrant green
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  playIcon: {
    color: "#000",
    fontSize: 16,
    marginLeft: 3,
  },
  revisionCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#00704A", // Starbucks signature accent
  },
  revisionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  revisionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  revisionBadge: {
    color: "#1ED760",
    fontSize: 12,
    fontWeight: "bold",
    backgroundColor: "rgba(30, 215, 96, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  revisionBody: {
    color: "#B3B3B3",
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: "#333333",
    borderRadius: 3,
    marginBottom: 8,
  },
  progressBarFill: {
    width: "38%",
    height: "100%",
    backgroundColor: "#00704A",
    borderRadius: 3,
  },
  progressText: {
    color: "#FFFFFF",
    fontSize: 12,
    marginBottom: 16,
    fontWeight: "500",
  },
  reviseButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
  },
  reviseButtonText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "700",
  },
  mcqGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  mcqButton: {
    width: "48%",
    backgroundColor: "#282828",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  mcqIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  mcqButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
