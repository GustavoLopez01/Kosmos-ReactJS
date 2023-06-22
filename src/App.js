import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";
import "./styles.css";

const URL = "https://jsonplaceholder.typicode.com/photos";

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    // Get photos when the component is ready
    const getPhotos = async () => {
      const response = await fetch(URL);
      const data = await response.json();
      setPhotos(data);
    };

    getPhotos();
  }, []);

  // The component is removed from the list by id
  const handleDeleteComponent = (id) => {
    const newArr = moveableComponents.filter((ele) => ele.id !== id);
    setMoveableComponents(newArr);

    if (selected === id) {
      setSelected(null);
    }
  };

  const pRef = useRef(null);

  // Create a new moveable component and add it to the array
  const addMoveable = () => {
    const COLORS = ["red", "blue", "yellow", "green", "purple"];

    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        updateEnd: true,
      },
    ]);
  };

  // The component is updated with new values
  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  const handleResizeStart = (index, e) => {
    //console.log("e", e.direction);
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      //console.log("width", moveableComponents, e);
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
      e.onResize = ({ width }) => {
        const dWith = width - initialWidth;
        const dleft = initialLeft - dWith;
        updateMoveable(e.target.id, { left: dleft, width }, false);
      };
    }
  };

  return (
    <main
      style={{
        height: "100vh",
        width: "100vw",
        alignItems: "center",
      }}
    >
      <h1>Challenge Kosmos React JS</h1>
      <hr />

      <section className="section-content">
        <div>
          <button className="button" onClick={addMoveable}>
            Add Moveable1
          </button>
          <div
            id="parent"
            ref={pRef}
            className="div-content"
           
          >
            {moveableComponents.map((item, index) => (
              <Component
                {...item}
                key={index}
                index={index}
                updateMoveable={updateMoveable}
                handleResizeStart={handleResizeStart}
                setSelected={setSelected}
                isSelected={selected === item.id}
                pRef={pRef}
                photos={photos[Math.floor(Math.random() * photos.length)]}
                handleDeleteComponent={handleDeleteComponent}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  id,
  setSelected,
  isSelected = false,
  handleResizeStart,
  photos,
  handleDeleteComponent,
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    id,
  });

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();

  const onResize = async (e) => {
    // Updated height and width
    let newWidth = e.width;
    let newHeight = e.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      color,
    });

    // Updated reference node
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
    });
  };

  const onResizeEnd = async (e) => {
    updateMoveable(
      id,
      {
        top: top,
        left: left,
        width: width,
        height: height,
        color,
      },
      true
    );
  };

  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          background: color,
        }}
        onClick={() => setSelected(id)}
      >
        <img
          src={photos.url}
          alt={photos.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <button
          onClick={() => handleDeleteComponent(id)}
          className="btn-delete"
        >
          delete
        </button>
      </div>

      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        snappable
        bounds={{ left: 0, top: 0, bottom: 0, right: 0, position: "css" }}
        onDrag={(e) => {
          e.target.style.transform = e.transform;
        }}
        onResize={onResize}
        onResizeStart={(e) => handleResizeStart(id, e)}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
        verticalGuidelines={[50, 150, 250, 450, 550]}
        horizontalGuidelines={[0, 100, 200, 400, 500]}
      />
    </>
  );
};
