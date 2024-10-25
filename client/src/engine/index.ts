import {
  AbstractMesh,
  AnimationGroup,
  ArcRotateCamera,
  AssetsManager,
  Color3,
  Color4,
  Engine,
  EngineFactory,
  FreeCamera,
  HemisphericLight,
  Mesh,
  Scene,
  SceneLoader,
  StandardMaterial,
  Texture,
  Vector3,
} from '@babylonjs/core'
import { AdvancedDynamicTexture, Button } from '@babylonjs/gui'
import '@babylonjs/inspector'
import '@babylonjs/loaders/glTF'

import { Stage } from './graphics/stage/stage'
import { Actor } from './graphics/actor/actor'

import { Login } from './gui/mainMenu'
import { CharacterSelect } from './gui/characterSelect'
import { CharacterCreation } from './gui/characterCreation/characterCreation'
import { random } from './core/random'
import Sky from './graphics/stage/sky'
import { TerrainChunkManager } from './graphics/stage/ground/terrainChunkManager'
import test_level from '../../public/assets/zones/rook_tower_06_25_2024.glb'
import rat from '../../public/assets/models/low_poly_rat.glb'
import cement from '../../public/assets/textures/polished-concrete-11811-in-architextures.jpg'
import tile from '../../public/assets/textures/demountable-ceiling-tile-stack-9606-in-architextures.jpg'

export enum GAME_STATE {
  LOGIN = 0,
  SIGN_UP = 1,
  SERVER_SELECT = 2,
  CHARACTER_SELECT = 3,
  LOADING = 4,
  PLAYING = 5,
  CHARACTER_CREATION_RACE = 6,
  CHARACTER_CREATION_CLASS = 7,
}

export class Game {
  // General Entire Application
  private _scene: Scene
  private _canvas: HTMLCanvasElement
  private _engine: Engine
  private _assetManager: AssetsManager

  //Game State Related
  public assets: {
    mesh: AbstractMesh | Mesh
    animations: Record<string, AnimationGroup>
  } //TODO: update this type to NOT by any
  private _stage: Stage
  private _player: Actor

  //Scene - related
  private _state: number = 3
  private _gamescene: Scene

  constructor() {
    this._canvas = this._createCanvas()

    // initialize babylon scene and engine
    this._init()
  }

  private async _init(): Promise<void> {
    this._engine = (await EngineFactory.CreateAsync(
      this._canvas,
      undefined,
    )) as Engine
    this._scene = new Scene(this._engine)
    this._assetManager = new AssetsManager(this._scene)

    const camera: ArcRotateCamera = new ArcRotateCamera(
      'Camera',
      Math.PI / 2,
      Math.PI / 2,
      2,
      Vector3.Zero(),
      this._scene,
    )
    camera.attachControl(this._canvas, true)
    const light1: HemisphericLight = new HemisphericLight(
      'light1',
      new Vector3(1, 1, 0),
      this._scene,
    )

    // hide/show the Inspector
    window.addEventListener('keydown', ev => {
      // Shift+Ctrl+Alt+I
      if (ev.shiftKey && ev.ctrlKey && ev.key === 'I') {
        if (this._scene.debugLayer.isVisible()) {
          this._scene.debugLayer.hide()
        } else {
          this._scene.debugLayer.show()
        }
      }
    })
    await this._main()
  }

  private async _main(): Promise<void> {
    // const token = localStorage.getItem('token');
    // if (!token) {
    await this._goToLogin()
    // }
    // const res = await fetch('http://localhost:4000/self', {
    //   mode: 'cors',
    //   headers: {
    //     authorization: `bearer ${token}`
    //   }
    // });
    // if (res.status === 200) {
    //   await this._goToCharacterSelect()
    // } else {
    //   await this._goToLogin()
    // }
    // this._goToGame()
    // run the main render loop
    this._engine.runRenderLoop(() => {
      switch (this._state) {
        case GAME_STATE.LOGIN:
          this._scene.render()
          break
        case GAME_STATE.PLAYING:
          this._scene.render()
          break
        case GAME_STATE.SERVER_SELECT:
          this._scene.render()
          break
        case GAME_STATE.CHARACTER_SELECT:
          this._scene.render()
          break
        case GAME_STATE.CHARACTER_CREATION_RACE:
          this._scene.render()
          break
        case GAME_STATE.CHARACTER_CREATION_CLASS:
          this._scene.render()
          break
      }
    })

    //resize if the screen is resized/rotated
    window.addEventListener('resize', () => {
      this._engine.resize()
    })
  }

  private async _goToLogin() {
    const mainMenu = new Login(
      this._canvas,
      this._engine,
      this._scene,
      this._goToCharacterSelect.bind(this),
    )
    this._scene = mainMenu.scene
  }

  private async _setUpGame() {
    let scene = new Scene(this._engine)
    this._gamescene = scene

    // const stage = new Stage(scene)
    // this._stage = stage
  }

  private async _goToCharacterSelect() {
    const characterSelect = new CharacterSelect(
      this._canvas,
      this._engine,
      this._scene,
      this._goToCharacterCreation.bind(this),
    )
    this._scene = characterSelect.scene
  }

  private async _goToCharacterCreation() {
    const characterCreation = new CharacterCreation(
      this._canvas,
      this._engine,
      this._scene,
    )
    this._scene = characterCreation.scene
  }

  private async _goToGame() {
    //--SETUP SCENE--
    this._scene.detachControl()
    // TODO: only here for debugging purposes
    await this._setUpGame()
    let scene = this._gamescene ? this._gamescene : new Scene(this._engine)
    // var hk = new HavokPlugin(true, this._havokInstance);
    // enable physics in the scene with a gravity
    // scene.enablePhysics(new Vector3(0, -9.8, 0), hk);
    scene.clearColor = new Color4(
      0.01568627450980392,
      0.01568627450980392,
      0.20392156862745098,
    ) // a color that fit the overall color scheme better
    // new TerrainChunkManager('ground', scene)
    const testLevel = await SceneLoader.ImportMeshAsync(
      null,
      '',
      test_level,
      scene,
    )
    testLevel.meshes.forEach(mesh => {
      mesh.checkCollisions = true
    })
    const ratMeshes = await SceneLoader.ImportMeshAsync(null, '', rat, scene)
    ratMeshes.meshes.forEach(mesh => {
      mesh.checkCollisions = true
    })
    ratMeshes.meshes[0].position = new Vector3(0, 2, 15)
    const buildingMaterial = new StandardMaterial('building_material', scene)
    buildingMaterial.diffuseTexture = new Texture(cement)
    // const building = scene.getMeshByName('Building')
    // const wall = scene.getMeshByName('Wall')
    const ground = scene.getMeshByName('Ground')
    // if( building && wall) {
    //   building.material = buildingMaterial
    //   wall.material = buildingMaterial
    // }
    if (ground) {
      const groundMaterial = new StandardMaterial('ground_material', scene)
      groundMaterial.diffuseTexture = new Texture(tile)
      groundMaterial.diffuseTexture.uScale = 20.0
      groundMaterial.diffuseTexture.vScale = 20.0
      ground.material = groundMaterial
    }
    new Sky('sky', scene)
    new Actor(scene, 'Hero', new Vector3(0, 0, 20))
    new Actor(scene, 'Villain', new Vector3(0, 2, 10), true)

    //primitive character and setting
    await this._initializeGameAsync(scene)

    //--WHEN SCENE FINISHED LOADING--
    await scene.whenReadyAsync()
    const mesh = scene.getMeshByName('outer')
    if (mesh) {
      mesh.position = new Vector3(0, 3, 0)
    }
    //get rid of start scene, switch to gamescene and change states
    this._scene.dispose()
    this._state = GAME_STATE.PLAYING
    this._scene = scene
    this._engine.hideLoadingUI()
    //the game is ready, attach control back
    this._scene.attachControl()
  }

  private async _goToLose(): Promise<void> {
    this._engine.displayLoadingUI()

    //--SCENE SETUP--
    this._scene.detachControl()
    let scene = new Scene(this._engine)
    scene.clearColor = new Color4(0, 0, 0, 1)
    let camera = new FreeCamera('lose_camera', new Vector3(0, 0, 0), scene)
    camera.setTarget(Vector3.Zero())

    //--GUI--
    const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI('UI')
    const mainBtn = Button.CreateSimpleButton('mainmenu', 'MAIN MENU')
    mainBtn.width = 0.2
    mainBtn.height = '40px'
    mainBtn.color = 'white'
    guiMenu.addControl(mainBtn)
    //this handles interactions with the start button attached to the scene
    mainBtn.onPointerUpObservable.add(() => {
      this._goToLogin()
    })

    //--SCENE FINISHED LOADING--
    await scene.whenReadyAsync()
    this._engine.hideLoadingUI() //when the scene is ready, hide loading
    //lastly set the current state to the lose state and set the scene to the lose scene
    this._scene.dispose()
    this._scene = scene
  }

  private _createCanvas() {
    const canvas = document.createElement('canvas')
    canvas.id = 'renderCanvas'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'
    canvas.oncontextmenu = () => false
    canvas.id = 'game'
    document.body.appendChild(canvas)
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    return canvas
  }

  private async _initializeGameAsync(scene: Scene): Promise<void> {
    //temporary light to light the entire scene
    const light0 = new HemisphericLight(
      'HemiLight',
      new Vector3(0, 1, 0),
      scene,
    )

    //Create the player
    // this._player = new Player(this.assets, scene, this._input)
  }
}
