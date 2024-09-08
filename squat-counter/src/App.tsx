import { useEffect, useState, useRef } from "react";
import {
  Layout,
  Select,
  theme,
  Typography,
  Row,
  Col,
  Button,
  Flex,
} from "antd";
import {
  PauseCircleOutlined,
  PlayCircleOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import "./App.css";

const { Header, Content } = Layout;
const { Text } = Typography;

function App() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    (async () => {
      if (
        !("mediaDevices" in navigator) ||
        !navigator.mediaDevices.getUserMedia
      ) {
        alert("getUserMedia is not supported!");
        return;
      }

      await navigator.mediaDevices.getUserMedia({ video: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      setVideoDevices(videoDevices);
    })();
  }, []);

  const devicesOptions = videoDevices.map((device) => {
    return { label: device.label, value: device.deviceId };
  });

  const handleOnClickPlayButton = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: deviceId } },
    });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
  };

  const handleOnClickPauseButton = () => {
    videoRef.current?.pause();
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header>
        <Text strong style={{ color: "#fff" }}>
          Squat Counter
        </Text>
      </Header>
      <Content
        style={{
          margin: 16,
          padding: 24,
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}
      >
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Flex justify="space-between" gap="small">
              <VideoCameraOutlined />
              <Select
                style={{ width: "100%" }}
                size="large"
                placeholder="Select a Camera"
                options={devicesOptions}
                onSelect={setDeviceId}
              ></Select>
            </Flex>
          </Col>
          <Col span={12}>
            <Flex gap="small">
              <Button
                type="primary"
                size="large"
                icon={<PlayCircleOutlined />}
                onClick={handleOnClickPlayButton}
              >
                Start
              </Button>
              <Button
                type="default"
                size="large"
                icon={<PauseCircleOutlined />}
                onClick={handleOnClickPauseButton}
              >
                Pause
              </Button>
            </Flex>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <video ref={videoRef}></video>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}

export default App;
