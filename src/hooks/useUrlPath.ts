import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

export default function useUrlPath(path: string) {
  const location = useLocation();
  const navigate = useNavigate();

  const [pathActive, setPathActive] = useState(false);

  useEffect(() => {
    setPathActive(location.pathname === path);
  }, [location.pathname, path]);

  const activate = (active: boolean) => {
    setPathActive(active);
    if (active) {
      navigate(path);
    } else {
      navigate('/');
    }
  };

  return {
    pathActive,
    activate,
    location,
  };
}
