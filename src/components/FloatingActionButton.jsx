import { Affix, Button, Transition } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";

export default function FloatingActionButton({ label, onClick }) {
  const isMobile = useMediaQuery("(max-width: 48em)");

  return (
    <Affix position={{ bottom: isMobile ? 16 : 20, right: isMobile ? 16 : 20 }} zIndex={200}>
      <Transition transition="slide-up" mounted duration={220}>
        {(transitionStyles) => (
          <Button
            style={transitionStyles}
            leftSection={<IconPlus size={18} />}
            onClick={onClick}
            size={isMobile ? "sm" : "md"}
            radius="xl"
            shadow="lg"
            styles={{
              root: {
                height: isMobile ? 48 : 54,
                paddingInline: isMobile ? 18 : 22,
                background: "linear-gradient(135deg, #dce8ec, #afc5ce)",
                color: "#24343a",
                border: "1px solid rgba(111, 143, 155, 0.22)",
                maxWidth: "calc(100vw - 32px)",
              },
            }}
          >
            {label}
          </Button>
        )}
      </Transition>
    </Affix>
  );
}
