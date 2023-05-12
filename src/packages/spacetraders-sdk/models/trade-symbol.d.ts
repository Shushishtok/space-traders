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
export declare const TradeSymbol: {
    readonly PreciousStones: "PRECIOUS_STONES";
    readonly QuartzSand: "QUARTZ_SAND";
    readonly SiliconCrystals: "SILICON_CRYSTALS";
    readonly AmmoniaIce: "AMMONIA_ICE";
    readonly LiquidHydrogen: "LIQUID_HYDROGEN";
    readonly LiquidNitrogen: "LIQUID_NITROGEN";
    readonly IceWater: "ICE_WATER";
    readonly ExoticMatter: "EXOTIC_MATTER";
    readonly AdvancedCircuitry: "ADVANCED_CIRCUITRY";
    readonly GravitonEmitters: "GRAVITON_EMITTERS";
    readonly Iron: "IRON";
    readonly IronOre: "IRON_ORE";
    readonly Copper: "COPPER";
    readonly CopperOre: "COPPER_ORE";
    readonly Aluminum: "ALUMINUM";
    readonly AluminumOre: "ALUMINUM_ORE";
    readonly Silver: "SILVER";
    readonly SilverOre: "SILVER_ORE";
    readonly Gold: "GOLD";
    readonly GoldOre: "GOLD_ORE";
    readonly Platinum: "PLATINUM";
    readonly PlatinumOre: "PLATINUM_ORE";
    readonly Diamonds: "DIAMONDS";
    readonly Uranite: "URANITE";
    readonly UraniteOre: "URANITE_ORE";
    readonly Meritium: "MERITIUM";
    readonly MeritiumOre: "MERITIUM_ORE";
    readonly Hydrocarbon: "HYDROCARBON";
    readonly Antimatter: "ANTIMATTER";
    readonly Fertilizers: "FERTILIZERS";
    readonly Fabrics: "FABRICS";
    readonly Food: "FOOD";
    readonly Jewelry: "JEWELRY";
    readonly Machinery: "MACHINERY";
    readonly Firearms: "FIREARMS";
    readonly AssaultRifles: "ASSAULT_RIFLES";
    readonly MilitaryEquipment: "MILITARY_EQUIPMENT";
    readonly Explosives: "EXPLOSIVES";
    readonly LabInstruments: "LAB_INSTRUMENTS";
    readonly Ammunition: "AMMUNITION";
    readonly Electronics: "ELECTRONICS";
    readonly ShipPlating: "SHIP_PLATING";
    readonly Equipment: "EQUIPMENT";
    readonly Fuel: "FUEL";
    readonly Medicine: "MEDICINE";
    readonly Drugs: "DRUGS";
    readonly Clothing: "CLOTHING";
    readonly Microprocessors: "MICROPROCESSORS";
    readonly Plastics: "PLASTICS";
    readonly Polynucleotides: "POLYNUCLEOTIDES";
    readonly Biocomposites: "BIOCOMPOSITES";
    readonly Nanobots: "NANOBOTS";
    readonly AiMainframes: "AI_MAINFRAMES";
    readonly QuantumDrives: "QUANTUM_DRIVES";
    readonly RoboticDrones: "ROBOTIC_DRONES";
    readonly CyberImplants: "CYBER_IMPLANTS";
    readonly GeneTherapeutics: "GENE_THERAPEUTICS";
    readonly NeuralChips: "NEURAL_CHIPS";
    readonly MoodRegulators: "MOOD_REGULATORS";
    readonly ViralAgents: "VIRAL_AGENTS";
    readonly MicroFusionGenerators: "MICRO_FUSION_GENERATORS";
    readonly Supergrains: "SUPERGRAINS";
    readonly LaserRifles: "LASER_RIFLES";
    readonly Holographics: "HOLOGRAPHICS";
    readonly ShipSalvage: "SHIP_SALVAGE";
    readonly RelicTech: "RELIC_TECH";
    readonly NovelLifeforms: "NOVEL_LIFEFORMS";
    readonly BotanicalSpecimens: "BOTANICAL_SPECIMENS";
    readonly CulturalArtifacts: "CULTURAL_ARTIFACTS";
    readonly ReactorSolarI: "REACTOR_SOLAR_I";
    readonly ReactorFusionI: "REACTOR_FUSION_I";
    readonly ReactorFissionI: "REACTOR_FISSION_I";
    readonly ReactorChemicalI: "REACTOR_CHEMICAL_I";
    readonly ReactorAntimatterI: "REACTOR_ANTIMATTER_I";
    readonly EngineImpulseDriveI: "ENGINE_IMPULSE_DRIVE_I";
    readonly EngineIonDriveI: "ENGINE_ION_DRIVE_I";
    readonly EngineIonDriveIi: "ENGINE_ION_DRIVE_II";
    readonly EngineHyperDriveI: "ENGINE_HYPER_DRIVE_I";
    readonly ModuleMineralProcessorI: "MODULE_MINERAL_PROCESSOR_I";
    readonly ModuleCargoHoldI: "MODULE_CARGO_HOLD_I";
    readonly ModuleCrewQuartersI: "MODULE_CREW_QUARTERS_I";
    readonly ModuleEnvoyQuartersI: "MODULE_ENVOY_QUARTERS_I";
    readonly ModulePassengerCabinI: "MODULE_PASSENGER_CABIN_I";
    readonly ModuleMicroRefineryI: "MODULE_MICRO_REFINERY_I";
    readonly ModuleOreRefineryI: "MODULE_ORE_REFINERY_I";
    readonly ModuleFuelRefineryI: "MODULE_FUEL_REFINERY_I";
    readonly ModuleScienceLabI: "MODULE_SCIENCE_LAB_I";
    readonly ModuleJumpDriveI: "MODULE_JUMP_DRIVE_I";
    readonly ModuleJumpDriveIi: "MODULE_JUMP_DRIVE_II";
    readonly ModuleJumpDriveIii: "MODULE_JUMP_DRIVE_III";
    readonly ModuleWarpDriveI: "MODULE_WARP_DRIVE_I";
    readonly ModuleWarpDriveIi: "MODULE_WARP_DRIVE_II";
    readonly ModuleWarpDriveIii: "MODULE_WARP_DRIVE_III";
    readonly ModuleShieldGeneratorI: "MODULE_SHIELD_GENERATOR_I";
    readonly ModuleShieldGeneratorIi: "MODULE_SHIELD_GENERATOR_II";
    readonly MountGasSiphonI: "MOUNT_GAS_SIPHON_I";
    readonly MountGasSiphonIi: "MOUNT_GAS_SIPHON_II";
    readonly MountGasSiphonIii: "MOUNT_GAS_SIPHON_III";
    readonly MountSurveyorI: "MOUNT_SURVEYOR_I";
    readonly MountSurveyorIi: "MOUNT_SURVEYOR_II";
    readonly MountSurveyorIii: "MOUNT_SURVEYOR_III";
    readonly MountSensorArrayI: "MOUNT_SENSOR_ARRAY_I";
    readonly MountSensorArrayIi: "MOUNT_SENSOR_ARRAY_II";
    readonly MountSensorArrayIii: "MOUNT_SENSOR_ARRAY_III";
    readonly MountMiningLaserI: "MOUNT_MINING_LASER_I";
    readonly MountMiningLaserIi: "MOUNT_MINING_LASER_II";
    readonly MountMiningLaserIii: "MOUNT_MINING_LASER_III";
    readonly MountLaserCannonI: "MOUNT_LASER_CANNON_I";
    readonly MountMissileLauncherI: "MOUNT_MISSILE_LAUNCHER_I";
    readonly MountTurretI: "MOUNT_TURRET_I";
};
export declare type TradeSymbol = typeof TradeSymbol[keyof typeof TradeSymbol];
//# sourceMappingURL=trade-symbol.d.ts.map