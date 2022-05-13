<template>
  <footer class="footer">
    <div class="container-fluid">
      <ul class="nav">
        <li class="nav-item">
          <a href="https://learn.blitzbudget.com" target="_blank" rel="noopener" class="nav-link">
            Learn
          </a>
        </li>
        <li class="nav-item">
          <a href="https://help.blitzbudget.com" target="_blank" rel="noopener" class="nav-link">
            Support
          </a>
        </li>
        <li class="nav-item">
          <a href="http://blog.blitzbudget.com" target="_blank" rel="noopener" class="nav-link">
            Blog
          </a>
        </li>
      </ul>
      <div class="copyright">
        &copy; {{ year }}, made with <i class="tim-icons icon-heart-2"></i> by
        <a href="https://www.blitzbudget.com" rel="noopener" target="_blank">BlitzBudget</a>
        for a better financial life.
      </div>
    </div>
  </footer>
</template>
<script>
export default {
  data() {
    return {
      year: new Date().getFullYear()
    };
  }
};
</script>
<style>
</style>
