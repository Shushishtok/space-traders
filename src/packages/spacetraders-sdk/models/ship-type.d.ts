/**
 * SpaceTraders API
 * SpaceTraders is an open-universe game and learning platform that offers a set of HTTP endpoints to control a fleet of ships and explore a multiplayer universe.  The API is documented using [OpenAPI](https://github.com/SpaceTradersAPI/api-docs). You can send your first request right here in your browser to check the status of the game server.  ```json http {   \"method\": \"GET\",   \"url\": \"https://api.spacetraders.io/v2\", } ```  Unlike a traditional game, SpaceTraders does not have a first-party client or app to play the game. Instead, you can use the API to build your own client, write a script to automate your ships, or try an app built by the community.  We have a [Discord channel](https://discord.com/invite/jh6zurdWk5) where you can share your projects, ask questions, and get help from other players.
 *
 * The version of the OpenAPI document: 2.0.0
 * Contact: joel@spacetraders.io
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
/**
 *
 * @export
 * @enum {string}
 */
export declare const ShipType: {
    readonly Probe: "SHIP_PROBE";
    readonly MiningDrone: "SHIP_MINING_DRONE";
    readonly Interceptor: "SHIP_INTERCEPTOR";
    readonly LightHauler: "SHIP_LIGHT_HAULER";
    readonly CommandFrigate: "SHIP_COMMAND_FRIGATE";
    readonly Explorer: "SHIP_EXPLORER";
    readonly HeavyFreighter: "SHIP_HEAVY_FREIGHTER";
    readonly LightShuttle: "SHIP_LIGHT_SHUTTLE";
    readonly OreHound: "SHIP_ORE_HOUND";
    readonly RefiningFreighter: "SHIP_REFINING_FREIGHTER";
};
export declare type ShipType = typeof ShipType[keyof typeof ShipType];
//# sourceMappingURL=ship-type.d.ts.map