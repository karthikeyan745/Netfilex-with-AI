try:
    import pandas as pd
    import numpy as np
    import matplotlib
    import seaborn as sns
    print("ALL_PACKAGES_AVAILABLE")
except ImportError as e:
    print(f"MISSING_PACKAGE: {e}")
