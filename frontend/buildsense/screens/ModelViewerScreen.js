import { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function ModelViewerScreen({ route, navigation }) {
  const layout = route?.params?.layout || null;
  const [rotating, setRotating] = useState(true);
  const animRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const houseRef = useRef(null);

  const onContextCreate = async (gl) => {
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setClearColor(0x0f0f1a);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000
    );
    camera.position.set(8, 6, 8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xe94560, 0.5, 20);
    pointLight.position.set(-5, 5, -5);
    scene.add(pointLight);

    // Build house model
    const houseGroup = new THREE.Group();

    // Foundation / base
    const foundationGeo = new THREE.BoxGeometry(6, 0.2, 5);
    const foundationMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
    const foundation = new THREE.Mesh(foundationGeo, foundationMat);
    foundation.position.y = -0.1;
    houseGroup.add(foundation);

    // Main walls
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xf5e6c8 });

    // Front wall
    const frontWallGeo = new THREE.BoxGeometry(6, 3, 0.2);
    const frontWall = new THREE.Mesh(frontWallGeo, wallMat);
    frontWall.position.set(0, 1.5, 2.5);
    houseGroup.add(frontWall);

    // Back wall
    const backWall = new THREE.Mesh(frontWallGeo, wallMat);
    backWall.position.set(0, 1.5, -2.5);
    houseGroup.add(backWall);

    // Left wall
    const sideWallGeo = new THREE.BoxGeometry(0.2, 3, 5);
    const leftWall = new THREE.Mesh(sideWallGeo, wallMat);
    leftWall.position.set(-3, 1.5, 0);
    houseGroup.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(sideWallGeo, wallMat);
    rightWall.position.set(3, 1.5, 0);
    houseGroup.add(rightWall);

    // Roof
    const roofGeo = new THREE.ConeGeometry(4.5, 2, 4);
    const roofMat = new THREE.MeshLambertMaterial({ color: 0xc0392b });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 4, 0);
    roof.rotation.y = Math.PI / 4;
    houseGroup.add(roof);

    // Door
    const doorGeo = new THREE.BoxGeometry(0.8, 1.5, 0.1);
    const doorMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 0.75, 2.56);
    houseGroup.add(door);

    // Windows — front
    const windowGeo = new THREE.BoxGeometry(0.8, 0.6, 0.1);
    const windowMat = new THREE.MeshLambertMaterial({ color: 0x87CEEB, transparent: true, opacity: 0.7 });

    const window1 = new THREE.Mesh(windowGeo, windowMat);
    window1.position.set(-1.5, 1.8, 2.56);
    houseGroup.add(window1);

    const window2 = new THREE.Mesh(windowGeo, windowMat);
    window2.position.set(1.5, 1.8, 2.56);
    houseGroup.add(window2);

    // Garden area (green ground patch)
    const gardenGeo = new THREE.BoxGeometry(3, 0.05, 2);
    const gardenMat = new THREE.MeshLambertMaterial({ color: 0x2ecc71 });
    const garden = new THREE.Mesh(gardenGeo, gardenMat);
    garden.position.set(-1.5, 0.02, 4);
    houseGroup.add(garden);

    // Small tree
    const trunkGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(-2, 0.4, 4.5);
    houseGroup.add(trunk);

    const leavesGeo = new THREE.SphereGeometry(0.5, 8, 8);
    const leavesMat = new THREE.MeshLambertMaterial({ color: 0x27ae60 });
    const leaves = new THREE.Mesh(leavesGeo, leavesMat);
    leaves.position.set(-2, 1.1, 4.5);
    houseGroup.add(leaves);

    // Ground
    const groundGeo = new THREE.PlaneGeometry(20, 20);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x3d5a3e });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.2;
    scene.add(ground);

    scene.add(houseGroup);
    houseRef.current = houseGroup;

    // Grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x333333, 0x333333);
    gridHelper.position.y = -0.19;
    scene.add(gridHelper);

    // Animation loop
    const animate = () => {
      animRef.current = requestAnimationFrame(animate);
      if (houseRef.current && rotating) {
        houseRef.current.rotation.y += 0.005;
      }
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    animate();
  };

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      <GLView style={styles.gl} onContextCreate={onContextCreate} />

      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.rotateBtn}
          onPress={() => setRotating(!rotating)}
        >
          <Ionicons name={rotating ? 'pause' : 'play'} size={20} color="#fff" />
          <Text style={styles.rotateBtnText}>{rotating ? 'Pause' : 'Rotate'}</Text>
        </TouchableOpacity>
      </View>

      {layout && (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{layout.name}</Text>
          <Text style={styles.infoDetail}>{layout.bhk} • {layout.sqft} sqft</Text>
          <Text style={styles.infoPrice}>₹{layout.estimated_cost_lakhs} Lakhs</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container  : { flex: 1, backgroundColor: '#0f0f1a' },
  gl         : { flex: 1 },
  overlay    : {
    position  : 'absolute',
    bottom    : 140,
    right     : 16,
  },
  rotateBtn  : {
    flexDirection   : 'row',
    backgroundColor : '#e94560',
    padding         : 12,
    borderRadius    : 30,
    alignItems      : 'center',
    gap             : 6,
  },
  rotateBtnText : { color: '#fff', fontWeight: 'bold' },
  infoCard   : {
    position        : 'absolute',
    bottom          : 0,
    left            : 0,
    right           : 0,
    backgroundColor : '#1a1a2eee',
    padding         : 20,
    borderTopWidth  : 1,
    borderTopColor  : '#333',
  },
  infoTitle  : { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  infoDetail : { fontSize: 13, color: '#888', marginTop: 4 },
  infoPrice  : { fontSize: 22, fontWeight: 'bold', color: '#e94560', marginTop: 6 },
});