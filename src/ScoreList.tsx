import { useEffect, useRef, useState } from "react";
import { Button, List, Space, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import AddScore from "./AddScore.tsx";
import { produce } from "immer";

const initUserList = [
  {
    label: "Kun",
    value: "Kun",
    score: 0,
    isMain: false,
    isDouble: false,
  },
  {
    label: "He",
    value: "He",
    score: 0,
    isMain: false,
    isDouble: false,
  },
  {
    label: "Chao",
    value: "Chao",
    score: 0,
    isMain: false,
    isDouble: false,
  },
  {
    label: "Hao",
    value: "Hao",
    score: 0,
    isMain: false,
    isDouble: false,
  },
];

const ScoreList = () => {
  const [userList, setUserList] = useState<any[]>([]);
  const addRef = useRef<any>(null);

  useEffect(() => {
    // init
    const storageUserList: any = localStorage.getItem("userList") || "[]";
    const _userList = JSON.parse(storageUserList);
    console.log(_userList);
    setUserList(_userList.length !== 0 ? _userList : initUserList);
  }, []);

  const changeScore = (_userList: any[]) => {
    setUserList(_userList);
    const userListJson = JSON.stringify(_userList);
    localStorage.setItem("userList", userListJson);
  };

  const clearScore = () => {
    const newUserList = produce(userList, (draft) => {
      draft.forEach((item: any) => {
        item.score = 0;
      });
    });

    changeScore(newUserList);
    localStorage.clear();
  };

  return (
    <div>
      <List
        // header={<div>Header</div>}
        // footer={}
        bordered
        dataSource={userList}
        renderItem={(item) => (
          <List.Item>
            <Space>
              <span>{item.value}</span>
              <span>{item.score}</span>
              {/* <Button icon="plus" onClick={addScore}></Button> */}
            </Space>
          </List.Item>
        )}
      />
      <div style={{ marginTop: 20 }}>
        <Space>
          <Button
            icon={<PlusOutlined />}
            onClick={() => addRef?.current.show()}
          >
            结算
          </Button>
          <Button
            onClick={() => {
              Modal.confirm({
                title: "确定清除?",
                onOk: () => clearScore(),
              });
            }}
          >
            清除记录
          </Button>
        </Space>
      </div>
      <AddScore ref={addRef} userList={userList} changeScore={changeScore} />
    </div>
  );
};

export default ScoreList;
