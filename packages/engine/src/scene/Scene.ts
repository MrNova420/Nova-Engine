/**
 * Scene
 *
 * Represents a 3D scene containing entities and resources.
 * Acts as a container for all game objects that should be rendered.
 */

import { Entity } from '../ecs/Entity';

/**
 * Scene class that manages a collection of entities
 */
export class Scene {
  private _name: string;
  private _entities: Set<Entity>;

  /**
   * Create a new scene
   * @param name - Scene name
   */
  constructor(name: string = 'Untitled Scene') {
    this._name = name;
    this._entities = new Set<Entity>();
  }

  /**
   * Get the scene name
   */
  get name(): string {
    return this._name;
  }

  /**
   * Set the scene name
   */
  set name(value: string) {
    this._name = value;
  }

  /**
   * Add an entity to the scene
   * @param entity - Entity to add
   */
  addEntity(entity: Entity): void {
    this._entities.add(entity);
  }

  /**
   * Remove an entity from the scene
   * @param entity - Entity to remove
   */
  removeEntity(entity: Entity): void {
    this._entities.delete(entity);
  }

  /**
   * Check if entity is in scene
   * @param entity - Entity to check
   */
  hasEntity(entity: Entity): boolean {
    return this._entities.has(entity);
  }

  /**
   * Get all entities in the scene
   */
  getEntities(): Entity[] {
    return Array.from(this._entities);
  }

  /**
   * Clear all entities from the scene
   */
  clear(): void {
    this._entities.clear();
  }

  /**
   * Get entity count
   */
  get entityCount(): number {
    return this._entities.size;
  }
}
