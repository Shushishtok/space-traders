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
 * @interface FactionTrait
 */
export interface FactionTrait {
    /**
     * The unique identifier of the trait.
     * @type {string}
     * @memberof FactionTrait
     */
    'symbol': FactionTraitSymbolEnum;
    /**
     * The name of the trait.
     * @type {string}
     * @memberof FactionTrait
     */
    'name': string;
    /**
     * A description of the trait.
     * @type {string}
     * @memberof FactionTrait
     */
    'description': string;
}
export declare const FactionTraitSymbolEnum: {
    readonly Bureaucratic: "BUREAUCRATIC";
    readonly Secretive: "SECRETIVE";
    readonly Capitalistic: "CAPITALISTIC";
    readonly Industrious: "INDUSTRIOUS";
    readonly Peaceful: "PEACEFUL";
    readonly Distrustful: "DISTRUSTFUL";
    readonly Welcoming: "WELCOMING";
    readonly Smugglers: "SMUGGLERS";
    readonly Scavengers: "SCAVENGERS";
    readonly Rebellious: "REBELLIOUS";
    readonly Exiles: "EXILES";
    readonly Pirates: "PIRATES";
    readonly Raiders: "RAIDERS";
    readonly Clan: "CLAN";
    readonly Guild: "GUILD";
    readonly Dominion: "DOMINION";
    readonly Fringe: "FRINGE";
    readonly Forsaken: "FORSAKEN";
    readonly Isolated: "ISOLATED";
    readonly Localized: "LOCALIZED";
    readonly Established: "ESTABLISHED";
    readonly Notable: "NOTABLE";
    readonly Dominant: "DOMINANT";
    readonly Inescapable: "INESCAPABLE";
    readonly Innovative: "INNOVATIVE";
    readonly Bold: "BOLD";
    readonly Visionary: "VISIONARY";
    readonly Curious: "CURIOUS";
    readonly Daring: "DARING";
    readonly Exploratory: "EXPLORATORY";
    readonly Resourceful: "RESOURCEFUL";
    readonly Flexible: "FLEXIBLE";
    readonly Cooperative: "COOPERATIVE";
    readonly United: "UNITED";
    readonly Strategic: "STRATEGIC";
    readonly Intelligent: "INTELLIGENT";
    readonly ResearchFocused: "RESEARCH_FOCUSED";
    readonly Collaborative: "COLLABORATIVE";
    readonly Progressive: "PROGRESSIVE";
    readonly Militaristic: "MILITARISTIC";
    readonly TechnologicallyAdvanced: "TECHNOLOGICALLY_ADVANCED";
    readonly Aggressive: "AGGRESSIVE";
    readonly Imperialistic: "IMPERIALISTIC";
    readonly TreasureHunters: "TREASURE_HUNTERS";
    readonly Dexterous: "DEXTEROUS";
    readonly Unpredictable: "UNPREDICTABLE";
    readonly Brutal: "BRUTAL";
    readonly Fleeting: "FLEETING";
    readonly Adaptable: "ADAPTABLE";
    readonly SelfSufficient: "SELF_SUFFICIENT";
    readonly Defensive: "DEFENSIVE";
    readonly Proud: "PROUD";
    readonly Diverse: "DIVERSE";
    readonly Independent: "INDEPENDENT";
    readonly SelfInterested: "SELF_INTERESTED";
    readonly Fragmented: "FRAGMENTED";
    readonly Commercial: "COMMERCIAL";
    readonly FreeMarkets: "FREE_MARKETS";
    readonly Entrepreneurial: "ENTREPRENEURIAL";
};
export declare type FactionTraitSymbolEnum = typeof FactionTraitSymbolEnum[keyof typeof FactionTraitSymbolEnum];
//# sourceMappingURL=faction-trait.d.ts.map