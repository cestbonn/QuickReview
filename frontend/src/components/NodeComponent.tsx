import React, { CSSProperties, MutableRefObject, Ref, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Position, Size } from '../models/GraphView';
import Node from '../models/Node';

function useDivProperties<T>(
  ref: MutableRefObject<null>, initialState: T, getter: (element: HTMLDivElement) => T
) {
  const [props, setProps] = useState(initialState);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const div = ref.current as HTMLDivElement;

    const value = getter(div);
    setProps(value);
  }, [ref]);
  return { props };
};

interface NodeProps {
  graphNode: Node;
  pos: Position;
  onResize?: (size: Size) => void;
}
export default function NodeComponent(props: NodeProps) {
  const ref = useRef(null);
  const { props: size } = useDivProperties(ref, { w: 0, h: 0 }, (div) => {
    return { w: div.offsetWidth, h: div.offsetHeight };
  });

  const { props: offset } = useDivProperties(ref, { x: 0, y: 0 }, (div) => {
    return { x: div.offsetLeft, y: div.offsetTop };
  });

  const [posStyle, setPosStyle] = useState<CSSProperties>({});

  useLayoutEffect(() => {
    const left = props.pos.x - size.w / 2 - offset.x;
    const top = props.pos.y - size.h / 2 - offset.y;

    setPosStyle({ left, top });
  }, [size, props.pos, offset]);

  useEffect(() => {
    if (props.onResize) {
      props.onResize(size);
    }
  }, [size]);


  return (
    <div ref={ref}
      style={posStyle}
      className="absolute p-2 bg-white m-4 rounded-md min-w-[120px] text-center shadow-md border"
    >
      {props.graphNode.title}
    </div>
  );
}
