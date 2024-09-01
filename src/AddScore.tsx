import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Select, Form, Button, Space, Modal, Transfer, Tooltip } from "antd";
import { produce } from "immer";

import {
  ModalForm,
  ProFormDigit,
  ProFormSelect,
} from "@ant-design/pro-components";

interface AddScoreProps {
  userList: any[];
  changeScore: (userList: any[]) => void;
}

interface AddScoreRefProps {
  show: () => void;
  hide: () => void;
}

const AddScore = forwardRef<AddScoreRefProps, AddScoreProps>(
  ({ userList, changeScore }, ref) => {
    const formRef = useRef<any>();
    const [visible, setVisible] = useState(false);

    const show = async () => {
      setVisible(true);
    };

    const hide = () => {
      setVisible(false);
      formRef.current?.resetFields();
    };
    useImperativeHandle(ref, () => ({
      show,
      hide,
    }));

    const compute = (formValue: any) => {
      const { currentMain, score, winner } = formValue;
      const currWinnerIdx = userList.findIndex(
        (item: any) => item.value === winner
      );
      const currMainIdx = userList.findIndex(
        (item: any) => item.value === currentMain
      );
      if (currentMain === winner) {
        // 本庄胡
        const newUserList = produce(userList, (draft) => {
          draft[currWinnerIdx].score = score * 2 * 3;
          draft.forEach((item: any, idx: number) => {
            if (idx !== currWinnerIdx) {
              item.score = item.score - score * 2;
            }
          });
        });

        changeScore(newUserList);
      } else {
        // 非本庄
        const newUserList = produce(userList, (draft) => {
          // 胡
          draft[currWinnerIdx].score = score * 4;
          // 庄输二倍
          draft[currMainIdx].score -= score * 2;
          draft.forEach((item: any, idx: number) => {
            if (idx !== currWinnerIdx && idx !== currMainIdx) {
              item.score = item.score - score;
            }
          });
        });
        changeScore(newUserList);
      }
    };

    return (
      <>
        <ModalForm
          formRef={formRef}
          title="结算本局"
          open={visible}
          autoFocusFirstInput
          onFinish={async (values: any) => {
            console.log(values);
            compute(values);
            hide();
          }}
        >
          {/* 庄 */}
          <ProFormSelect name="currentMain" options={userList} label="庄" />
          {/* score */}
          <ProFormDigit name="score" label="分数" />
          {/* 胡 */}
          <ProFormSelect name="winner" options={userList} label="胡" />
        </ModalForm>
      </>
    );
  }
);

export default AddScore;
