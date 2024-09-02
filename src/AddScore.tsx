import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { produce } from "immer";

import {
  ModalForm,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
} from "@ant-design/pro-components";
import { Button, Flex, Form } from "antd";

interface AddScoreProps {
  userList: any[];
  changeScore: (userList: any[]) => void;
}

interface AddScoreRefProps {
  show: () => void;
  hide: () => void;
}

const baseScoreOptions = [
  {
    name: "捉五",
    value: 3,
  },
  {
    name: "龙",
    value: 4,
  },
  {
    name: "双混五",
    value: 6,
  },
  {
    name: "混掉龙",
    value: 8,
  },
  {
    name: "捉五龙",
    value: 7,
  },
  {
    name: "素胡",
    value: 2,
  },
];

const AddScore = forwardRef<AddScoreRefProps, AddScoreProps>(
  ({ userList, changeScore }, ref) => {
    const formRef = useRef<any>();
    const [visible, setVisible] = useState(false);
    const [addForm] = Form.useForm<any>();

    const formCurMain = Form.useWatch("currentMain", addForm);

    const show = async () => {
      setVisible(true);
    };

    const hide = () => {
      console.log(123);
      setVisible(false);
      formRef.current?.resetFields();
    };
    useImperativeHandle(ref, () => ({
      show,
      hide,
    }));

    const compute = (formValue: any) => {
      const { currentMain, score, winner, doubleUserList } = formValue;
      const currWinnerIdx = userList.findIndex(
        (item: any) => item.value === winner
      );
      const currMainIdx = userList.findIndex(
        (item: any) => item.value === currentMain
      );
      if (currentMain === winner) {
        // 本庄胡
        const newUserList = produce(userList, (draft) => {
          draft[currWinnerIdx].score += score * 2 * 3;
          draft.forEach((item: any, idx: number) => {
            if (idx !== currWinnerIdx) {
              if (doubleUserList && doubleUserList.includes(item.value)) {
                // 有拉庄
                item.score -= score * 4;
                draft[currWinnerIdx].score += score * 2;
              } else {
                item.score -= score * 2;
              }
            }
          });
        });

        changeScore(newUserList);
      } else {
        // 非本庄
        const newUserList = produce(userList, (draft) => {
          // 胡
          draft[currWinnerIdx].score += score * 4;
          // 庄输二倍
          draft[currMainIdx].score -= score * 2;
          if (doubleUserList) {
            draft[currWinnerIdx].score += score * 2;
            draft[currMainIdx].score -= score * 2;
          }
          draft.forEach((item: any, idx: number) => {
            if (idx !== currWinnerIdx && idx !== currMainIdx) {
              item.score -= score;
            }
          });
        });
        changeScore(newUserList);
      }
    };

    const doubleUserOptions = useMemo(() => {
      return userList.filter((item: any) => item.value !== formCurMain) || [];
    }, [formCurMain]);

    return (
      <>
        <ModalForm
          formRef={formRef}
          form={addForm}
          title="结算本局"
          open={visible}
          onFinish={async (values: any) => {
            console.log(values);
            compute(values);
            hide();
          }}
          modalProps={{
            onCancel: () => {
              setVisible(false);
            },
          }}
        >
          {/* 庄 */}
          <ProFormSelect
            name="currentMain"
            options={userList}
            label="庄"
            rules={[
              {
                required: true,
              },
            ]}
          />
          {/* score */}
          <ProFormDigit
            name="score"
            label="平庄分数"
            rules={[
              {
                required: true,
              },
            ]}
          />
          <Flex wrap gap="small" style={{ paddingBottom: 16 }}>
            {baseScoreOptions.map((item: any) => (
              <Button
                size="small"
                onClick={() => {
                  addForm.setFieldValue("score", item.value);
                }}
                // style={{ width: 70, marginRight: 10, marginBottom: 10 }}
              >
                {item.name} +{item.value}
              </Button>
            ))}
          </Flex>
          {/* 胡 */}
          <ProFormSelect
            name="winner"
            options={userList}
            label="胡"
            rules={[
              {
                required: true,
              },
            ]}
          />
          {/* 拉庄 */}
          <ProFormSelect
            name="doubleUserList"
            disabled={!formCurMain}
            options={doubleUserOptions}
            mode="multiple"
            label="拉庄"
          />
          {/* 坐庄 */}
          <ProFormSwitch name="mainDouble" label="坐庄" disabled />
        </ModalForm>
      </>
    );
  }
);

export default AddScore;
