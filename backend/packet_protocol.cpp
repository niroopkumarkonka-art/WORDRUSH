// ============================================================================
// WORDRUSH ARENA - High-Throughput Packet Protocol Implementation
// ============================================================================

#include "packet_protocol.hpp"
#include <chrono>

namespace WordRush {

std::string PacketProtocol::packetTypeToString(PacketType type) {
    switch (type) {
        case PKT_CONNECT: return "CONNECT";
        case PKT_CREATE_ROOM: return "CREATE_ROOM";
        case PKT_JOIN_ROOM: return "JOIN_ROOM";
        case PKT_SET_SECRET_WORD: return "SET_SECRET_WORD";
        case PKT_SUBMIT_GUESS: return "SUBMIT_GUESS";
        case PKT_GUESS_FEEDBACK: return "GUESS_FEEDBACK";
        case PKT_TACTICAL_HINT: return "HINT_REVEALED";
        case PKT_ROUND_END: return "ROUND_ENDED";
        case PKT_GAME_OVER: return "GAME_OVER";
        case PKT_PLAYER_DISCONNECT: return "PLAYER_DISCONNECTED";
        case PKT_HEARTBEAT_PING: return "PING";
        case PKT_HEARTBEAT_PONG: return "PONG";
        case PKT_ONLINE_COUNT_UPDATE: return "ONLINE_COUNT_UPDATE";
        default: return "UNKNOWN";
    }
}

PacketType PacketProtocol::stringToPacketType(const std::string& typeStr) {
    if (typeStr == "CONNECT") return PKT_CONNECT;
    if (typeStr == "CREATE_ROOM") return PKT_CREATE_ROOM;
    if (typeStr == "JOIN_ROOM") return PKT_JOIN_ROOM;
    if (typeStr == "SET_SECRET_WORD") return PKT_SET_SECRET_WORD;
    if (typeStr == "SUBMIT_GUESS") return PKT_SUBMIT_GUESS;
    if (typeStr == "GUESS_FEEDBACK") return PKT_GUESS_FEEDBACK;
    if (typeStr == "HINT_REVEALED") return PKT_TACTICAL_HINT;
    if (typeStr == "ROUND_ENDED") return PKT_ROUND_END;
    if (typeStr == "GAME_OVER") return PKT_GAME_OVER;
    if (typeStr == "PLAYER_DISCONNECTED") return PKT_PLAYER_DISCONNECT;
    if (typeStr == "PING") return PKT_HEARTBEAT_PING;
    if (typeStr == "PONG") return PKT_HEARTBEAT_PONG;
    if (typeStr == "ONLINE_COUNT_UPDATE") return PKT_ONLINE_COUNT_UPDATE;
    return PKT_UNKNOWN;
}

std::string PacketProtocol::serializeDeduction(
    const std::string& roomCode,
    const std::string& playerId,
    const DeductionResult& deduction,
    int attemptNumber,
    int attemptsRemaining
) {
    std::ostringstream ss;
    ss << "{\"type\":\"GUESS_FEEDBACK\",\"payload\":{";
    ss << "\"roomCode\":\"" << roomCode << "\",";
    ss << "\"playerId\":\"" << playerId << "\",";
    ss << "\"guess\":\"" << deduction.guess << "\",";
    ss << "\"isCorrect\":" << (deduction.isExactMatch ? "true" : "false") << ",";
    ss << "\"attemptNumber\":" << attemptNumber << ",";
    ss << "\"attemptsRemaining\":" << attemptsRemaining << ",";
    ss << "\"states\":[";
    for (size_t i = 0; i < deduction.states.size(); ++i) {
        ss << static_cast<int>(deduction.states[i]);
        if (i + 1 < deduction.states.size()) ss << ",";
    }
    ss << "],";
    ss << "\"timestamp\":" << std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::system_clock::now().time_since_epoch()).count();
    ss << "}}";
    return ss.str();
}

std::string PacketProtocol::serializeRoomSync(
    const std::string& roomCode,
    const std::string& phase,
    int currentRound,
    int totalRounds,
    const std::string& hostId,
    const std::string& guestId,
    int hostScore,
    int guestScore
) {
    std::ostringstream ss;
    ss << "{\"type\":\"ROOM_SYNC\",\"payload\":{";
    ss << "\"roomCode\":\"" << roomCode << "\",";
    ss << "\"phase\":\"" << phase << "\",";
    ss << "\"currentRound\":" << currentRound << ",";
    ss << "\"totalRounds\":" << totalRounds << ",";
    ss << "\"hostId\":\"" << hostId << "\",";
    ss << "\"guestId\":\"" << guestId << "\",";
    ss << "\"hostScore\":" << hostScore << ",";
    ss << "\"guestScore\":" << guestScore;
    ss << "}}";
    return ss.str();
}

std::string PacketProtocol::serializeOnlineCount(int activeUsersCount) {
    std::ostringstream ss;
    ss << "{\"type\":\"ONLINE_COUNT_UPDATE\",\"payload\":{";
    ss << "\"onlineCount\":" << activeUsersCount;
    ss << "}}";
    return ss.str();
}

bool PacketProtocol::parseSimpleJson(const std::string& json, std::map<std::string, std::string>& outFields) {
    outFields.clear();
    bool inKey = false, inVal = false;
    std::string key = "", val = "";

    for (size_t i = 0; i < json.length(); ++i) {
        char c = json[i];
        if (c == '\"') {
            if (!inKey && !inVal) {
                // Determine if this is key or value based on previous non-whitespace
                inKey = true;
                key = "";
            } else if (inKey) {
                inKey = false;
            } else if (inVal) {
                inVal = false;
                outFields[key] = val;
            }
        } else if (c == ':' && !inKey && !inVal) {
            inVal = true;
            val = "";
        } else if (c == ',' && !inKey && !inVal) {
            // End of pair
        } else {
            if (inKey) key += c;
            else if (inVal && c != '\"' && c != ' ') val += c;
        }
    }
    return !outFields.empty();
}

} // namespace WordRush
