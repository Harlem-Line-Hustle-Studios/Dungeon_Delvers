import {
  ArcRotateCamera,
  Color3,
  Color4,
  Engine,
  EngineFactory,
  FreeCamera,
  HemisphericLight,
  Matrix,
  Mesh,
  MeshBuilder,
  PointLight,
  Quaternion,
  Scene,
  SceneLoader,
  ShadowGenerator,
  Vector3,
} from '@babylonjs/core'
import { AdvancedDynamicTexture, Button, Control } from '@babylonjs/gui'
import '@babylonjs/inspector'
import '@babylonjs/loaders/glTF'

import { Stage } from './stage/stage'
import { Player } from './player/player'

import human_male from '../../public/assets/models/Human_Male.glb'
import { PlayerInput } from './core/inputController'

export enum GAME_STATE {
  MENU = 0,
  PLAYING = 1,
  LOADING = 2,
  CUTSCENE = 3,
  LOSE = 4,
}
export class Game {
  // General Entire Application
  private _scene: Scene
  private _canvas: HTMLCanvasElement
  private _engine: Engine

  //Game State Related
  public assets: any //TODO: update this type to NOT by any
  private _input: PlayerInput
  private _stage: Stage
  private _player: Player

  //Scene - related
  private _state: number = 2
  private _gamescene: Scene
  private _cutScene: Scene

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
    const sphere: Mesh = MeshBuilder.CreateSphere(
      'sphere',
      { diameter: 1 },
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
    // await this._goToMenu()
    await this._goToGame()
    // run the main render loop
    this._engine.runRenderLoop(() => {
      switch (this._state) {
        case GAME_STATE.MENU:
          this._scene.render()
          break
        case GAME_STATE.PLAYING:
          this._scene.render()
          break
        case GAME_STATE.LOADING:
          this._scene.render()
          break
        case GAME_STATE.CUTSCENE:
          this._scene.render()
          break
        case GAME_STATE.LOSE:
          this._scene.render()
          break
      }
    })

    //resize if the screen is resized/rotated
    window.addEventListener('resize', () => {
      this._engine.resize()
    })
  }

  private async _goToMenu() {
    this._engine.displayLoadingUI()

    this._scene.detachControl()
    let scene = new Scene(this._engine)
    scene.clearColor = new Color4(0, 0, 0, 1)
    let camera = new FreeCamera('camera1', new Vector3(0, 0, 0), scene)
    camera.setTarget(Vector3.Zero())

    //create a fullscreen ui for all of our GUI elements
    const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI('UI')
    guiMenu.idealHeight = 720 //fit our fullscreen ui to this height

    //create a simple button
    const startBtn = Button.CreateSimpleButton('start', 'PLAY')
    startBtn.width = 0.2
    startBtn.height = '40px'
    startBtn.color = 'white'
    startBtn.top = '-14px'
    startBtn.thickness = 0
    startBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM
    guiMenu.addControl(startBtn)

    //this handles interactions with the start button attached to the scene
    startBtn.onPointerDownObservable.add(() => {
      this._goToCutScene()
      scene.detachControl() //observables disabled
    })

    //--SCENE FINISHED LOADING--
    await scene.whenReadyAsync()
    this._engine.hideLoadingUI()
    //lastly set the current state to the start state and set the scene to the start scene
    this._scene.dispose()
    this._scene = scene
    this._state = GAME_STATE.MENU
  }

  private async _goToCutScene(): Promise<void> {
    this._engine.displayLoadingUI()
    //--SETUP SCENE--
    //dont detect any inputs from this ui while the game is loading
    this._scene.detachControl()
    this._cutScene = new Scene(this._engine)
    let camera = new FreeCamera('camera1', new Vector3(0, 0, 0), this._cutScene)
    camera.setTarget(Vector3.Zero())
    this._cutScene.clearColor = new Color4(0, 0, 0, 1)

    //--GUI--
    const cutScene = AdvancedDynamicTexture.CreateFullscreenUI('cutscene')

    //--PROGRESS DIALOGUE--
    const next = Button.CreateSimpleButton('next', 'NEXT')
    next.color = 'white'
    next.thickness = 0
    next.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM
    next.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT
    next.width = '64px'
    next.height = '64px'
    next.top = '-3%'
    next.left = '-12%'
    cutScene.addControl(next)

    next.onPointerUpObservable.add(() => {
      this._goToGame()
    })

    //--WHEN SCENE IS FINISHED LOADING--
    await this._cutScene.whenReadyAsync()
    this._engine.hideLoadingUI()
    this._scene.dispose()
    this._state = GAME_STATE.CUTSCENE
    this._scene = this._cutScene

    //--START LOADING AND SETTING UP THE GAME DURING THIS SCENE--
    var finishedLoading = false
    await this._setUpGame().then(res => {
      finishedLoading = true
    })
  }

  private async _setUpGame() {
    let scene = new Scene(this._engine)
    this._gamescene = scene

    const stage = new Stage(scene)
    this._stage = stage

    await this._stage.load()

    await this._loadCharacterAssets(scene) //character
  }

  private async _goToGame() {
    //--SETUP SCENE--
    this._scene.detachControl()
    // TODO: only here for debugging purposes
    await this._setUpGame()
    this._engine.displayLoadingUI()
    let scene = this._gamescene ? this._gamescene : new Scene(this._engine)
    scene.clearColor = new Color4(
      0.01568627450980392,
      0.01568627450980392,
      0.20392156862745098,
    ) // a color that fit the overall color scheme better
    let camera: ArcRotateCamera = new ArcRotateCamera(
      'Camera',
      Math.PI / 2,
      Math.PI / 2,
      2,
      Vector3.Zero(),
      scene,
    )
    camera.setTarget(Vector3.Zero())

    //--GUI--
    const playerUI = AdvancedDynamicTexture.CreateFullscreenUI('UI')
    //dont detect any inputs from this ui while the game is loading
    scene.detachControl()

    //create a simple button
    const loseBtn = Button.CreateSimpleButton('lose', 'LOSE')
    loseBtn.width = 0.2
    loseBtn.height = '40px'
    loseBtn.color = 'white'
    loseBtn.top = '-14px'
    loseBtn.thickness = 0
    loseBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM
    playerUI.addControl(loseBtn)

    //this handles interactions with the start button attached to the scene
    loseBtn.onPointerDownObservable.add(() => {
      this._goToLose()
      scene.detachControl() //observables disabled
    })

    //--INPUT--
    this._input = new PlayerInput(scene) //detect keyboard/mobile inputs

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
    let camera = new FreeCamera('camera1', new Vector3(0, 0, 0), scene)
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
      this._goToMenu()
    })

    //--SCENE FINISHED LOADING--
    await scene.whenReadyAsync()
    this._engine.hideLoadingUI() //when the scene is ready, hide loading
    //lastly set the current state to the lose state and set the scene to the lose scene
    this._scene.dispose()
    this._scene = scene
    this._state = GAME_STATE.LOSE
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

  private async _loadCharacterAssets(scene: Scene) {
    async function loadCharacter() {
      const outer = MeshBuilder.CreateBox(
        'outer',
        { width: 2, depth: 1, height: 3 },
        scene,
      )
      outer.isVisible = false
      outer.isPickable = false
      outer.checkCollisions = true

      //move origin of box collider to the bottom of the mesh (to match player mesh)
      outer.bakeTransformIntoVertices(Matrix.Translation(0, 3, 0))

      //for collisions
      outer.ellipsoid = new Vector3(1, 1.5, 1)
      outer.ellipsoidOffset = new Vector3(0, 1.5, 0)

      outer.rotationQuaternion = new Quaternion(0, 1, 0, 0)

      return SceneLoader.ImportMeshAsync(null, '', human_male, scene).then(
        result => {
          const root = result.meshes[0]
          root.position.y = 1.5
          //body is our actual player mesh
          const body = root
          body.parent = outer
          body.isPickable = false //so our raycasts dont hit ourself
          body.getChildMeshes().forEach(m => {
            m.isPickable = false
          })

          return {
            mesh: outer as Mesh,
            animationGroups: result.animationGroups,
          }
        },
      )
    }
    return loadCharacter().then(assets => {
      this.assets = assets
    })
  }

  private async _initializeGameAsync(scene: Scene): Promise<void> {
    //temporary light to light the entire scene
    const light0 = new HemisphericLight(
      'HemiLight',
      new Vector3(0, 1, 0),
      scene,
    )

    const light = new PointLight('sparklight', new Vector3(0, 0, 0), scene)
    light.diffuse = new Color3(
      0.08627450980392157,
      0.10980392156862745,
      0.15294117647058825,
    )
    light.intensity = 35
    light.radius = 1

    const shadowGenerator = new ShadowGenerator(1024, light)
    shadowGenerator.darkness = 0.4

    //Create the player
    this._player = new Player(this.assets, scene, shadowGenerator, this._input)
    const camera = this._player.activatePlayerCamera()
  }
}
