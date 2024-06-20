import {
  AbstractMesh,
  AnimationGroup,
  FollowCamera,
  Mesh,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsShapeType,
  Scene,
  SceneLoader,
  Vector3,
} from '@babylonjs/core'
import { InputManager } from '../core/inputManager'

const SELECTED_CHARACTER = 'm_human'

export class Player {
  private _animations: Record<string, AnimationGroup>
  private _canvas: HTMLCanvasElement
  private _mesh: AbstractMesh
  private _parent: any
  private _scene: Scene
  private _input: InputManager
  private forwardSpeed: number = 0.08
  private backwardSpeed: number = this.forwardSpeed * 0.5
  private turnSpeed: number = 0.1
  constructor(scene: Scene) {
    this._canvas = scene.getEngine().getRenderingCanvas() as HTMLCanvasElement
    this._scene = scene
    this._input = new InputManager(scene)
    this.load()
    this._scene.onBeforeRenderObservable.add(() => {
      this._beforeRenderUpdate()
    })
  }
  async load() {
    // const result = await CharacterModels.loadCharacterMeshes(this._scene)
    // Object.entries(result.characters).forEach(([key, value]) => {
    //   console.log(key, SELECTED_CHARACTER, key === SELECTED_CHARACTER)
    //   value.mesh.isVisible = key === SELECTED_CHARACTER
    // })
    // this._mesh = result.characters[SELECTED_CHARACTER].mesh
    this._mesh = MeshBuilder.CreateCapsule('player', {
      height: 2.5,
      radius: 0.5,
    })
    const playerCamera = new FollowCamera(
      'playerCamera',
      new Vector3(0, 10, 5),
      this._scene,
      this._mesh,
    )
    playerCamera.rotationOffset = 180
    this._mesh.rotation.y = 0
    this._mesh.position.y = 1.25
    // new PhysicsAggregate(this._mesh, PhysicsShapeType.BOX, { mass: 1, restitution: 0.1 }, this._scene);
    // this._animations = result.characters[SELECTED_CHARACTER].animations
    this._scene.activeCamera = playerCamera
  }

  private _beforeRenderUpdate() {
    this._update()
  }
  private _update() {
    var keydown = false
    //Manage the movements of the character (e.g. position, direction)
    if (this._input.inputMap['w']) {
      this._mesh.moveWithCollisions(
        this._mesh.forward.scaleInPlace(this.forwardSpeed),
      )
      keydown = true
    }
    if (this._input.inputMap['s']) {
      this._mesh.moveWithCollisions(
        this._mesh.forward.scaleInPlace(-this.backwardSpeed),
      )

      keydown = true
    }
    if (this._input.inputMap['a']) {
      this._mesh.rotate(Vector3.Up(), -this.turnSpeed)

      keydown = true
    }
    if (this._input.inputMap['d']) {
      this._mesh.rotate(Vector3.Up(), this.turnSpeed)

      keydown = true
    }
    if (this._input.inputMap[' ']) {
      this._mesh.moveWithCollisions(new Vector3(0, 0.1, 0))
      keydown = true
    }
  }
}
