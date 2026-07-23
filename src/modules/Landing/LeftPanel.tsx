import { Box, List, Paper, Typography } from "@mui/material";
import type { PoolItemProps, PoolProps, tableData } from "../../types/inbox";
import {
  InboxIcon,
  KeyRightArrowIcon,
  MenuIcon,
  TaskIcon,
} from "../../icons/Icons";
import { columnFlex, hoverSx, selectedSx } from "../../utils/styles";
import LastLogin from "./LastLogin";
import { useNavigate } from "react-router-dom";
import { getSearchApplicationPath } from "../../routes/routes";

export const ALL_CASES_POOL = "ALL CASES";

type LeftPanelProps = PoolProps & {
  poolData: Record<string, tableData[]>;
};
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

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
const str = label;
const taskName = str.replace(/_/g, " ");
  return (
    <Box
      onClick={handlePoolClick}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 1,
        py: 1,
        pl:2,
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

        {toTitleCase(taskName)}{" "}
        {selectedPool != "User Management" &&
          showCount &&
          count !== undefined && count > 0 &&
          `(${count})`}
      </Typography>

      {isSelected && <KeyRightArrowIcon style={{ color: "#9A2529" }} />}
    </Box>
  );
};
const LeftPanel = ({
  toggle,
  setToggle,
  selectedPool,
  onSelectPool,
  poolData,
}: LeftPanelProps) => {
  const navigate = useNavigate();
  const poolNames = Object.keys(poolData).sort((firstPool, secondPool) =>
    firstPool.replace(/_/g, " ").localeCompare(secondPool.replace(/_/g, " "), undefined, {
      sensitivity: "base",
    }),
  );
  const totalCaseCount = Object.values(poolData).reduce(
    (sum, rows) => sum + rows.length,
    0,
  );
  const searchItem = (
    <PoolItem
      label="Search Applications"
      value="Search Applications"
      selectedPool={selectedPool}
      onClick={() => navigate(getSearchApplicationPath())}
      showCount={false}
    />
  );
  const getPoolCount = (pool: string) => poolData[pool]?.length ?? 0;
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
        <Box sx={{ pl: 1, pt: 1 }}>
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
            <Box sx={{ ...columnFlex, gap: 4, p: 1 }}>
              <InboxIcon />
              <TaskIcon />
            </Box>
          ) : (
            <>
              {searchItem}

              {poolNames.length === 0 ? (
                <Typography sx={{ p: 1, color: "#999" }}>
                  No work pools available.
                </Typography>
              ) : (
                <List disablePadding>
                  <PoolItem
                    label={ALL_CASES_POOL}
                    value={ALL_CASES_POOL}
                    selectedPool={selectedPool}
                    onClick={onSelectPool}
                    count={totalCaseCount}
                  />
                  {poolNames.map((pool) => (
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
