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
import { ShipRequirements } from './ship-requirements';
/**
 * The frame of the ship. The frame determines the number of modules and mounting points of the ship, as well as base fuel capacity. As the condition of the frame takes more wear, the ship will become more sluggish and less maneuverable.
 * @export
 * @interface ShipFrame
 */
export interface ShipFrame {
    /**
     *
     * @type {string}
     * @memberof ShipFrame
     */
    'symbol': ShipFrameSymbolEnum;
    /**
     *
     * @type {string}
     * @memberof ShipFrame
     */
    'name': string;
    /**
     *
     * @type {string}
     * @memberof ShipFrame
     */
    'description': string;
    /**
     * Condition is a range of 0 to 100 where 0 is completely worn out and 100 is brand new.
     * @type {number}
     * @memberof ShipFrame
     */
    'condition'?: number;
    /**
     *
     * @type {number}
     * @memberof ShipFrame
     */
    'moduleSlots': number;
    /**
     *
     * @type {number}
     * @memberof ShipFrame
     */
    'mountingPoints': number;
    /**
     *
     * @type {number}
     * @memberof ShipFrame
     */
    'fuelCapacity': number;
    /**
     *
     * @type {ShipRequirements}
     * @memberof ShipFrame
     */
    'requirements': ShipRequirements;
}
export declare const ShipFrameSymbolEnum: {
    readonly Probe: "FRAME_PROBE";
    readonly Drone: "FRAME_DRONE";
    readonly Interceptor: "FRAME_INTERCEPTOR";
    readonly Racer: "FRAME_RACER";
    readonly Fighter: "FRAME_FIGHTER";
    readonly Frigate: "FRAME_FRIGATE";
    readonly Shuttle: "FRAME_SHUTTLE";
    readonly Explorer: "FRAME_EXPLORER";
    readonly Miner: "FRAME_MINER";
    readonly LightFreighter: "FRAME_LIGHT_FREIGHTER";
    readonly HeavyFreighter: "FRAME_HEAVY_FREIGHTER";
    readonly Transport: "FRAME_TRANSPORT";
    readonly Destroyer: "FRAME_DESTROYER";
    readonly Cruiser: "FRAME_CRUISER";
    readonly Carrier: "FRAME_CARRIER";
};
export declare type ShipFrameSymbolEnum = typeof ShipFrameSymbolEnum[keyof typeof ShipFrameSymbolEnum];
//# sourceMappingURL=ship-frame.d.ts.map