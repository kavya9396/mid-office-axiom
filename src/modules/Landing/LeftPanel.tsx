import { Box, List, Paper, Typography } from "@mui/material";
import type {
  PoolItemProps,
  PoolProps,
  RoleGroup,
  tableData,
} from "../../types/inbox";
import {
  InboxIcon,
  KeyRightArrowIcon,
  MenuIcon,
  TaskIcon,
} from "../../icons/Icons";
import { columnFlex, hoverSx, selectedSx } from "../../utils/styles";
import CustomAccordion from "../../components/ui/Accordion/Accordion";
import LastLogin from "./LastLogin";

type LeftPanelProps = PoolProps & {
  mode?: "simple" | "accordion";
  role?: string;
  roles: RoleGroup[];
  rows: tableData[];
  poolData: Record<string, tableData[]>;
  poolCounts: Record<string, number>;
};

const PoolItem = ({
  label,
  value,
  selectedPool,
  onClick,
  count,
  showCount = true,
}: PoolItemProps) => {
  const isSelected = selectedPool === value;
  const handlePoolClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    onClick(value);
  };

  return (
    <Box
      onClick={handlePoolClick}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        py: 1.5,
        mb: 1,
        pl: label !== "All Cases" ? 4 : 2,
        ...(isSelected ? selectedSx : hoverSx),
        cursor: "pointer",
      }}
    >
      <Typography
        sx={{
          fontWeight: 600,
          color: isSelected ? "#9A2529" : "#999999",
          fontSize: "14px",
        }}
      >

        {label}{" "}
        {selectedPool != "User Management" &&
          showCount &&
          count !== undefined &&
          `(${count})`}
      </Typography>

      {isSelected && <KeyRightArrowIcon style={{ color: "#9A2529" }} />}
    </Box>
  );
};
const LeftPanel = ({
  toggle,
  setToggle,
  mode,
  roles,
  selectedPool,
  onSelectPool,
  poolCounts,
}: LeftPanelProps) => {
  const isAccordion = mode === "accordion";

  const poolEntries = roles.filter((group) => group.pools?.length > 0);
  const allPools = poolEntries.flatMap((group) => group.pools);
  const searchItem = (
    <PoolItem
      label="Search Applications"
      value="Search Applications"
      selectedPool={selectedPool}
      onClick={onSelectPool}
      showCount={false}
    />
  );

  const getPoolCount = (pool: string) => poolCounts[pool] ?? 0;

  return (
    <Box
      sx={{
        width: toggle ? "64px" : "250px",
        backgroundColor: "#fff",
        transition: "all 0.3s",
        overflow: "hidden",
        height: "90vh",
      }}
    >
      <Paper
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top Section */}
        <Box sx={{ pl: 2, pt: 2 }}>
          <Box
            onClick={() => setToggle((prev) => !prev)}
            sx={{ cursor: "pointer" }}
          >
            <MenuIcon />
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          {toggle ? (
            <Box sx={{ ...columnFlex, gap: 4, p: 2 }}>
              <InboxIcon />
              <TaskIcon />
            </Box>
          ) : (
            <>
              {searchItem}

              {poolEntries.length === 0 ? (
                <Typography sx={{ p: 2, color: "#999" }}>
                  No work pools available.
                </Typography>
              ) : isAccordion ? (
                <>
                  {poolEntries.map((group, index) => (
                    <CustomAccordion
                      key={group.name}
                      title={group.name.toUpperCase()}
                      titleFontSize={14}
                      titleColor="#5D5D5D"
                      detailPadding={0}
                      defaultExpanded={index === 0}
                    >
                      <List disablePadding>
                        {group.pools.map((pool) => (
                          <PoolItem
                            key={pool}
                            label={pool}
                            value={pool}
                            selectedPool={selectedPool}
                            onClick={onSelectPool}
                            count={getPoolCount(pool)}
                          />
                        ))}
                      </List>
                    </CustomAccordion>
                  ))}
                </>
              ) : (
                <List disablePadding>
                  {allPools.map((pool) => (
                    <PoolItem
                      key={pool}
                      label={pool}
                      value={pool}
                      selectedPool={selectedPool}
                      onClick={onSelectPool}
                      count={getPoolCount(pool)}
                    />
                  ))}
                </List>
              )}
            </>
          )}
        </Box>

        {/* Bottom Footer */}
        {
          !toggle && (
            <Box sx={{ mx: "auto", my: 2 }}>
                <LastLogin lastLogin={"2026-05-24T11:32:00"} />
            </Box>
          )
        }
      </Paper>
    </Box>
  );
};

export default LeftPanel;
