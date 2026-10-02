#ifndef WORDRUSH_PACKET_PROTOCOL_HPP
#define WORDRUSH_PACKET_PROTOCOL_HPP

// ============================================================================
// WORDRUSH ARENA - High-Throughput Packet Protocol & JSON Serializer
// Encodes and decodes real-time game telemetry, deduction results,
// room synchronizations, and player lifecycle actions
// ============================================================================

#include <string>
#include <vector>
#include <map>
#include <sstream>
#include <cstdint>
#include "wordle_deducer.hpp"

namespace WordRush {

enum PacketType {
    PKT_CONNECT,
    PKT_CREATE_ROOM,
    PKT_JOIN_ROOM,
    PKT_SET_SECRET_WORD,
    PKT_SUBMIT_GUESS,
    PKT_GUESS_FEEDBACK,
    PKT_TACTICAL_HINT,
    PKT_ROUND_END,
    PKT_GAME_OVER,
    PKT_PLAYER_DISCONNECT,
    PKT_HEARTBEAT_PING,
    PKT_HEARTBEAT_PONG,
    PKT_ONLINE_COUNT_UPDATE,
    PKT_UNKNOWN
};

struct GamePacket {
    PacketType type;
    std::string typeString;
    std::string senderId;
    std::string roomCode;
    std::string payloadJson;
    int64_t timestamp;
};

class PacketProtocol {
public:
    static std::string packetTypeToString(PacketType type);
    static PacketType stringToPacketType(const std::string& typeStr);

    // Serialization
    static std::string serializeDeduction(
        const std::string& roomCode,
        const std::string& playerId,
        const DeductionResult& deduction,
        int attemptNumber,
        int attemptsRemaining
    );

    static std::string serializeRoomSync(
        const std::string& roomCode,
        const std::string& phase,
        int currentRound,
        int totalRounds,
        const std::string& hostId,
        const std::string& guestId,
        int hostScore,
        int guestScore
    );

    static std::string serializeOnlineCount(int activeUsersCount);

    // Deserialization helper
    static bool parseSimpleJson(const std::string& json, std::map<std::string, std::string>& outFields);
};

} // namespace WordRush

#endif // WORDRUSH_PACKET_PROTOCOL_HPP
