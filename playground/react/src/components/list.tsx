import * as React from "react";

type List = {
  name?: string;
  list: string[];
};

const List = (props: List) => {
  const { list } = props;
  const listItems = list.map((item) => <li key={item}>{item}</li>);
  return (
    <>
      <div>
        <div className="text-xl font-semibold mb-4">Services</div>
        <ul className="list-disc pl-6 space-y-2">{listItems}</ul>
      </div>
    </>
  );
};

export default List;
